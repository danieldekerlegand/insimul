import { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Loader2, Maximize, Minimize, ZoomIn, ZoomOut, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { ProceduralBuildingConfig, ProceduralStylePreset, InteriorTemplateConfig } from '@shared/game-engine/types';
import type { VisualAsset } from '@shared/schema';
import {
  type InteriorLayoutTemplate,
  INTERIOR_LAYOUT_TEMPLATES,
  getTemplateForBuildingType,
  resolveRoomZone,
  getFurnitureSetForRoom,
} from '@shared/game-engine/interior-templates';
import { BUILDING_TYPE_DEFAULTS, getBuildingDefaults } from '@shared/game-engine/building-defaults';
import { getCategoryForType } from '@shared/game-engine/building-categories';
import { getCategoryPreset } from '@shared/game-engine/building-style-presets';

interface BuildingModelPreviewProps {
  /** Direct path to the 3D model file */
  modelPath?: string | null;
  /** Direct path to the interior 3D model file */
  interiorModelPath?: string | null;
  /** Tint color for the building type (business=orange, residence=blue) */
  tintColor?: { r: number; g: number; b: number };
  /** Label shown in the badge */
  buildingType?: string;
  /** Business type for interior template lookup */
  businessType?: string;
  /** Procedural building config from asset collection */
  proceduralConfig?: ProceduralBuildingConfig | null;
  /** Zone type for style resolution */
  zone?: 'commercial' | 'residential';
  /** Interior config overrides (textures, furniture set, lighting preset) */
  interiorConfig?: InteriorTemplateConfig;
  /** Visual assets for resolving texture IDs to file paths */
  interiorAssets?: VisualAsset[];
  className?: string;
  /** Externally controlled view mode — when set, hides internal tab toggle */
  initialViewMode?: 'exterior' | 'interior';
  /** Hide the internal Exterior/Interior tab toggle */
  hideTabs?: boolean;
}

// Known environment/ground meshes to strip from loaded models
function isEnvMesh(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('ground') || lower.includes('plane') ||
    lower.includes('floor') || lower.includes('terrain') ||
    lower.includes('environment') || lower.includes('backdrop');
}

export function BuildingModelPreview({
  modelPath,
  interiorModelPath,
  tintColor,
  buildingType,
  businessType,
  proceduralConfig,
  interiorConfig,
  interiorAssets,
  zone,
  className = '',
  initialViewMode,
  hideTabs,
}: BuildingModelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const autoRotateRef = useRef(true);

  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meshSource, setMeshSource] = useState<'model' | 'placeholder'>('placeholder');
  const [viewMode, setViewMode] = useState<'exterior' | 'interior'>(initialViewMode || 'exterior');

  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.06, 0.06, 0.1, 1);
    sceneRef.current = scene;

    const camera = new BABYLON.ArcRotateCamera('cam', Math.PI / 4, Math.PI / 3.5, 5, new BABYLON.Vector3(0, 0.5, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;
    camera.wheelPrecision = 40;
    cameraRef.current = camera;

    // Lighting
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.8;
    const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-1, -2, -1), scene);
    dir.intensity = 0.45;

    // Ground disc
    const ground = BABYLON.MeshBuilder.CreateDisc('ground', { radius: 2, tessellation: 32 }, scene);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.01;
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.18);
    groundMat.specularColor = BABYLON.Color3.Black();
    ground.material = groundMat;

    // Auto-rotate
    scene.onBeforeRenderObservable.add(() => {
      if (autoRotateRef.current) camera.alpha += 0.005;
    });

    // Resolve style from procedural config for placeholder
    const resolvedPreset = resolvePresetForPreview(proceduralConfig, buildingType, zone);

    // Resolve interior template for procedural interior preview
    const interiorTemplate = buildingType
      ? getTemplateForBuildingType(buildingType, businessType)
      : undefined;

    // Determine which model to load based on view mode
    const activeModelPath = viewMode === 'interior' ? interiorModelPath : modelPath;

    if (activeModelPath) {
      setIsLoading(true);
      const fullPath = activeModelPath.startsWith('/') ? activeModelPath : `/${activeModelPath}`;
      const parts = fullPath.split('/');
      const fileName = parts.pop() || '';
      const rootUrl = parts.join('/') + '/';

      BABYLON.SceneLoader.ImportMesh(
        '',
        rootUrl,
        fileName,
        scene,
        (meshes) => {
          if (meshes.length > 0) {
            // Strip environment meshes (only for exterior)
            if (viewMode === 'exterior') {
              const envMeshes = meshes.filter(m => isEnvMesh(m.name));
              for (const m of envMeshes) m.dispose();
            }
            const remaining = meshes.filter(m => !m.isDisposed());

            if (remaining.length > 0) {
              centerAndFrameMeshes(remaining, camera, ground);
              setMeshSource('model');
            } else {
              buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset, buildingType, interiorAssets);
              setMeshSource('placeholder');
            }
          } else {
            buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset, buildingType, interiorAssets);
            setMeshSource('placeholder');
          }
          setIsLoading(false);
        },
        undefined,
        () => {
          // If interior model fails to load, fall back to procedural interior
          if (viewMode === 'interior' && interiorTemplate) {
            buildProceduralInterior(scene, camera, ground, interiorTemplate, interiorConfig, interiorAssets);
            setMeshSource('model');
          } else {
            buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset, buildingType, interiorAssets);
            setMeshSource('placeholder');
          }
          setIsLoading(false);
        }
      );
    } else if (viewMode === 'interior') {
      if (interiorTemplate) {
        buildProceduralInterior(scene, camera, ground, interiorTemplate, interiorConfig, interiorAssets);
        setMeshSource('model');
      } else {
        // No template or model — signal that no interior is configured
        setMeshSource('placeholder');
      }
      setIsLoading(false);
    } else {
      buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset, buildingType, interiorAssets);
      setMeshSource('placeholder');
      setIsLoading(false);
    }

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
    };
  }, [modelPath, interiorModelPath, tintColor?.r, tintColor?.g, tintColor?.b, proceduralConfig, buildingType, businessType, zone, viewMode, interiorConfig, interiorAssets]);

  const handleZoomIn = () => {
    if (cameraRef.current) cameraRef.current.radius = Math.max(1, cameraRef.current.radius - 0.8);
  };
  const handleZoomOut = () => {
    if (cameraRef.current) cameraRef.current.radius = Math.min(20, cameraRef.current.radius + 0.8);
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      requestAnimationFrame(() => engineRef.current?.resize());
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Always show tabs when a building type is provided so users can see interior status
  const hasInterior = !!buildingType || !!interiorModelPath;

  const sourceLabel = viewMode === 'interior'
    ? (meshSource === 'model' ? 'Interior' : 'No interior configured')
    : (meshSource === 'model' ? (buildingType || '3D Model') : 'Procedural');

  return (
    <div className={`flex flex-col ${className}`}>
      {hasInterior && !hideTabs && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'exterior' | 'interior')} className="mb-1">
          <TabsList className="h-7 w-full">
            <TabsTrigger value="exterior" className="text-xs h-5 flex-1">Exterior</TabsTrigger>
            <TabsTrigger value="interior" className="text-xs h-5 flex-1">Interior</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden flex-1">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ touchAction: 'none' }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        {!isLoading && (
          <>
            <Badge variant="secondary" className="absolute top-2 left-2 text-xs bg-black/50 text-white border-none">
              {sourceLabel}
            </Badge>

            {viewMode === 'interior' && (interiorConfig?.furnitureSet || interiorConfig?.lightingPreset) && (
              <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
                {interiorConfig?.furnitureSet && (
                  <Badge variant="secondary" className="text-[9px] bg-black/50 text-white border-none px-1.5 py-0">
                    {interiorConfig.furnitureSet.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Badge>
                )}
                {interiorConfig?.lightingPreset && (
                  <Badge variant="secondary" className="text-[9px] bg-black/50 text-white border-none px-1.5 py-0">
                    {interiorConfig.lightingPreset.replace(/\b\w/g, c => c.toUpperCase())}
                  </Badge>
                )}
              </div>
            )}

            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 bg-black/50 hover:bg-black/70"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-3 w-3 text-white" /> : <Maximize className="h-3 w-3 text-white" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 bg-black/50 hover:bg-black/70"
                onClick={handleZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-3 w-3 text-white" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 bg-black/50 hover:bg-black/70"
                onClick={handleZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-3 w-3 text-white" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 bg-black/50 hover:bg-black/70"
                onClick={() => setAutoRotate(!autoRotate)}
                title={autoRotate ? 'Stop rotation' : 'Resume rotation'}
              >
                {autoRotate ? <Pause className="h-3 w-3 text-white" /> : <Play className="h-3 w-3 text-white" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centerAndFrameMeshes(
  meshes: BABYLON.AbstractMesh[],
  camera: BABYLON.ArcRotateCamera,
  ground: BABYLON.Mesh
) {
  let min = new BABYLON.Vector3(Infinity, Infinity, Infinity);
  let max = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
  meshes.forEach(m => {
    if (m.getBoundingInfo) {
      const bi = m.getBoundingInfo();
      min = BABYLON.Vector3.Minimize(min, bi.boundingBox.minimumWorld);
      max = BABYLON.Vector3.Maximize(max, bi.boundingBox.maximumWorld);
    }
  });
  const center = BABYLON.Vector3.Center(min, max);
  const size = max.subtract(min);
  const maxDim = Math.max(size.x, size.y, size.z);

  // Shift model so base is at y=0 and centered on x/z
  meshes.forEach(m => {
    if (m.parent === null) {
      m.position.x -= center.x;
      m.position.z -= center.z;
      m.position.y -= min.y;
    }
  });

  camera.target = new BABYLON.Vector3(0, size.y / 2, 0);
  camera.radius = maxDim * 2;
  ground.scaling = new BABYLON.Vector3(maxDim * 0.8, maxDim * 0.8, 1);
}

/** Resolve a style preset from the procedural config for preview rendering.
 *  Falls back to category-based default presets when no config is provided. */
export function resolvePresetForPreview(
  config?: ProceduralBuildingConfig | null,
  buildingType?: string,
  zone?: 'commercial' | 'residential',
): ProceduralStylePreset | null {
  if (config && config.stylePresets.length > 0) {
    // Check type-specific override
    const typeOverride = buildingType ? config.buildingTypeOverrides?.[buildingType] : undefined;
    if (typeOverride?.stylePresetId) {
      const preset = config.stylePresets.find(p => p.id === typeOverride.stylePresetId);
      if (preset) return preset;
    }

    // Zone default
    const defaultId = zone === 'commercial'
      ? config.defaultCommercialStyleId
      : config.defaultResidentialStyleId;
    if (defaultId) {
      const preset = config.stylePresets.find(p => p.id === defaultId);
      if (preset) return preset;
    }

    // First from config presets
    return config.stylePresets[0];
  }

  // Fallback: derive a style preset from the building's category
  if (buildingType) {
    const category = getCategoryForType(buildingType);
    if (category) {
      return getCategoryPreset(category, buildingType) ?? null;
    }
  }

  return null;
}

function buildProceduralPlaceholder(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  ground: BABYLON.Mesh,
  tintColor?: { r: number; g: number; b: number },
  preset?: ProceduralStylePreset | null,
  buildingType?: string,
  assets?: VisualAsset[],
) {
  // Use preset colors if available, otherwise fall back to tint
  const wallColor = preset && preset.baseColors.length > 0
    ? new BABYLON.Color3(preset.baseColors[0].r, preset.baseColors[0].g, preset.baseColors[0].b)
    : tintColor
      ? new BABYLON.Color3(tintColor.r, tintColor.g, tintColor.b)
      : new BABYLON.Color3(0.45, 0.45, 0.4);

  const roofColor = preset
    ? new BABYLON.Color3(preset.roofColor.r, preset.roofColor.g, preset.roofColor.b)
    : wallColor.scale(0.7);

  const windowColor = preset
    ? new BABYLON.Color3(preset.windowColor.r, preset.windowColor.g, preset.windowColor.b)
    : new BABYLON.Color3(0.7, 0.75, 0.8);

  const doorColor = preset
    ? new BABYLON.Color3(preset.doorColor.r, preset.doorColor.g, preset.doorColor.b)
    : new BABYLON.Color3(0.4, 0.3, 0.2);

  // Resolve texture paths from asset IDs
  const wallTexturePath = resolveAssetPath(preset?.wallTextureId, assets);
  const roofTexturePath = resolveAssetPath(preset?.roofTextureId, assets);
  const doorTexturePath = resolveAssetPath(preset?.doorTextureId, assets);
  const windowTexturePath = resolveAssetPath(preset?.windowTextureId, assets);

  // Look up building defaults for accurate dimensions
  const defaults = buildingType ? BUILDING_TYPE_DEFAULTS[buildingType] : undefined;

  const mat = new BABYLON.StandardMaterial('placeholderMat', scene);
  mat.diffuseColor = wallColor;
  mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
  if (wallTexturePath) {
    const tex = new BABYLON.Texture(wallTexturePath, scene);
    tex.uScale = 2;
    tex.vScale = 2;
    mat.diffuseTexture = tex;
    // Texture is multiplied by diffuseColor — use white so texture shows true color
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  }

  const hasPorch = preset?.hasPorch ?? defaults?.hasPorch ?? false;
  const hasBalcony = preset?.hasIronworkBalcony || preset?.hasBalcony || defaults?.hasBalcony;
  const hasChimney = defaults?.hasChimney ?? false;

  // Use building defaults for floor count and aspect ratio
  const floors = defaults?.floors ?? (hasBalcony ? 2 : 1);
  const floorHeight = 0.5;
  const bodyHeight = floors * floorHeight;
  const porchElev = hasPorch ? 0.15 : 0;

  // Use width/depth ratio from defaults, normalized to fit preview
  const rawW = defaults?.width ?? 10;
  const rawD = defaults?.depth ?? 10;
  const maxRaw = Math.max(rawW, rawD);
  const bw = (rawW / maxRaw) * 1.2;  // normalize to ~1.2 unit max
  const bd = (rawD / maxRaw) * 1.2;

  // Building body
  const body = BABYLON.MeshBuilder.CreateBox('body', {
    width: bw, height: bodyHeight, depth: bd,
  }, scene);
  body.position.y = bodyHeight / 2 + porchElev;
  body.material = mat;

  // Door on front face
  const doorMat = new BABYLON.StandardMaterial('doorMat', scene);
  doorMat.diffuseColor = doorColor;
  doorMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  if (doorTexturePath) {
    const tex = new BABYLON.Texture(doorTexturePath, scene);
    doorMat.diffuseTexture = tex;
    doorMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  }
  const doorH = Math.min(floorHeight * 0.7, 0.4);
  const doorW = doorH * 0.5;
  const door = BABYLON.MeshBuilder.CreateBox('door', {
    width: doorW, height: doorH, depth: 0.02,
  }, scene);
  door.position.set(0, doorH / 2 + porchElev, bd / 2 + 0.011);
  door.material = doorMat;

  // Windows on front face for each floor
  const windowMat = new BABYLON.StandardMaterial('windowMat', scene);
  windowMat.diffuseColor = windowColor;
  windowMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  windowMat.alpha = 0.85;
  if (windowTexturePath) {
    const tex = new BABYLON.Texture(windowTexturePath, scene);
    windowMat.diffuseTexture = tex;
    windowMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  }

  const winH = floorHeight * 0.35;
  const winW = winH * 0.7;
  // Place windows symmetrically, avoiding door position on ground floor
  const winXPositions = bw > 0.6 ? [-bw * 0.3, bw * 0.3] : [-bw * 0.25, bw * 0.25];
  for (let f = 0; f < floors; f++) {
    const startX = f === 0 ? winXPositions : [...winXPositions]; // all floors get side windows
    if (f > 0 && bw > 0.8) startX.push(0); // upper floors also get center window
    for (const wx of startX) {
      const win = BABYLON.MeshBuilder.CreateBox(`win_${f}_${wx}`, {
        width: winW, height: winH, depth: 0.02,
      }, scene);
      const winY = porchElev + f * floorHeight + floorHeight * 0.55;
      win.position.set(wx, winY, bd / 2 + 0.011);
      win.material = windowMat;
    }
  }

  // Roof — proper gable shape using custom vertices
  const roofMat = new BABYLON.StandardMaterial('roofMat', scene);
  roofMat.diffuseColor = roofColor;
  roofMat.specularColor = BABYLON.Color3.Black();
  roofMat.backFaceCulling = false; // custom vertex geometry has mixed winding
  if (roofTexturePath) {
    const tex = new BABYLON.Texture(roofTexturePath, scene);
    tex.uScale = 2;
    tex.vScale = 2;
    roofMat.diffuseTexture = tex;
    roofMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  }

  const roofStyle = preset?.roofStyle ?? 'gable';
  const roofOverhang = 0.1;
  const rhw = bw / 2 + roofOverhang; // half-width with overhang
  const rhd = bd / 2 + roofOverhang;
  const frontRhd = hasPorch ? rhd + 0.3 : rhd;

  if (roofStyle === 'flat') {
    const flatRoof = BABYLON.MeshBuilder.CreateBox('roof', {
      width: bw + roofOverhang * 2, height: 0.05, depth: bd + roofOverhang * 2,
    }, scene);
    flatRoof.position.y = bodyHeight + porchElev + 0.025;
    flatRoof.material = roofMat;
  } else {
    const roofHeight = roofStyle === 'hip' || roofStyle === 'hipped_dormers' ? 0.3 : 0.4;
    const roofMesh = new BABYLON.Mesh('roof', scene);

    if (roofStyle === 'hip' || roofStyle === 'hipped_dormers') {
      // Hipped roof — ridge shorter than building length
      const ridgeLen = Math.max(rhw * 0.4, 0.1);
      const positions = [
        -rhw, 0, frontRhd,  rhw, 0, frontRhd,  rhw, 0, -rhd,  -rhw, 0, -rhd,
        -ridgeLen, roofHeight, 0,  ridgeLen, roofHeight, 0,
      ];
      const indices = [
        0, 5, 1, 0, 4, 5,  1, 5, 2, 2, 5, 4,  2, 4, 3,  3, 4, 0,  0, 1, 2, 0, 2, 3,
      ];
      const normals: number[] = [];
      const vd = new BABYLON.VertexData();
      vd.positions = positions;
      vd.indices = indices;
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      vd.normals = normals;
      vd.applyToMesh(roofMesh);
    } else {
      // Gable / side_gable roof
      const isside = roofStyle === 'side_gable';
      const ridgeInset = Math.min(rhw * 0.5, rhd * 0.5);
      const ridgeHalfLen = (isside ? rhd : rhw) - ridgeInset;
      let positions: number[];
      if (isside) {
        positions = [
          -rhw, 0, frontRhd,  rhw, 0, frontRhd,  rhw, 0, -rhd,  -rhw, 0, -rhd,
          0, roofHeight, -ridgeHalfLen,  0, roofHeight, ridgeHalfLen,
        ];
      } else {
        positions = [
          -rhw, 0, frontRhd,  rhw, 0, frontRhd,  rhw, 0, -rhd,  -rhw, 0, -rhd,
          -ridgeHalfLen, roofHeight, 0,  ridgeHalfLen, roofHeight, 0,
        ];
      }
      const indices = [
        0, 5, 1, 0, 4, 5,  1, 5, 2,  2, 3, 4, 2, 4, 5,  3, 0, 4,  0, 1, 2, 0, 2, 3,
      ];
      const normals: number[] = [];
      const vd = new BABYLON.VertexData();
      vd.positions = positions;
      vd.indices = indices;
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      vd.normals = normals;
      vd.applyToMesh(roofMesh);
    }
    roofMesh.position.y = bodyHeight + porchElev;
    roofMesh.material = roofMat;
  }

  // Porch
  if (hasPorch) {
    const porchMat = new BABYLON.StandardMaterial('porchMat', scene);
    porchMat.diffuseColor = wallColor.scale(0.75);
    porchMat.specularColor = BABYLON.Color3.Black();

    const porchDepth = 0.35;
    // Foundation
    const foundation = BABYLON.MeshBuilder.CreateBox('porchFound', {
      width: bw + 0.1, height: porchElev, depth: porchDepth,
    }, scene);
    foundation.position.y = porchElev / 2;
    foundation.position.z = bd / 2 + porchDepth / 2;
    foundation.material = porchMat;

    // Porch deck
    const deck = BABYLON.MeshBuilder.CreateBox('porchDeck', {
      width: bw + 0.1, height: 0.03, depth: porchDepth,
    }, scene);
    deck.position.y = porchElev;
    deck.position.z = bd / 2 + porchDepth / 2;
    deck.material = porchMat;

    // Posts
    const postMat = new BABYLON.StandardMaterial('postMat', scene);
    postMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.88);
    for (const x of [-bw * 0.35, bw * 0.35]) {
      const post = BABYLON.MeshBuilder.CreateCylinder(`post_${x}`, {
        diameter: 0.04, height: floorHeight, tessellation: 6,
      }, scene);
      post.position.set(x, porchElev + floorHeight / 2, bd / 2 + porchDepth * 0.8);
      post.material = postMat;
    }

    // Steps
    const steps = preset?.porchSteps ?? 2;
    const stepMat = new BABYLON.StandardMaterial('stepMat', scene);
    stepMat.diffuseColor = wallColor.scale(0.6);
    stepMat.specularColor = BABYLON.Color3.Black();
    for (let s = 0; s < steps; s++) {
      const stepH = porchElev / steps;
      const step = BABYLON.MeshBuilder.CreateBox(`step_${s}`, {
        width: doorW * 2, height: stepH, depth: 0.08,
      }, scene);
      step.position.set(0, stepH * (s + 0.5), bd / 2 + porchDepth + 0.04 * (steps - s));
      step.material = stepMat;
    }
  }

  // Ironwork balcony
  if (hasBalcony && floors > 1) {
    const ironMat = new BABYLON.StandardMaterial('ironMat', scene);
    ironMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    const balcSlab = BABYLON.MeshBuilder.CreateBox('balcSlab', {
      width: bw * 0.9, height: 0.03, depth: 0.2,
    }, scene);
    balcSlab.position.y = floorHeight + porchElev;
    balcSlab.position.z = bd / 2 + 0.1;
    balcSlab.material = ironMat;

    const balcRail = BABYLON.MeshBuilder.CreateBox('balcRail', {
      width: bw * 0.9, height: 0.15, depth: 0.02,
    }, scene);
    balcRail.position.y = floorHeight + porchElev + 0.12;
    balcRail.position.z = bd / 2 + 0.2;
    balcRail.material = ironMat;

    // Balcony railing posts
    const railCount = Math.max(2, Math.floor(bw / 0.15));
    for (let i = 0; i <= railCount; i++) {
      const rx = -bw * 0.45 + (bw * 0.9 / railCount) * i;
      const railPost = BABYLON.MeshBuilder.CreateCylinder(`railPost_${i}`, {
        diameter: 0.015, height: 0.15, tessellation: 6,
      }, scene);
      railPost.position.set(rx, floorHeight + porchElev + 0.075, bd / 2 + 0.2);
      railPost.material = ironMat;
    }
  }

  // Shutters
  if (preset?.hasShutters) {
    const shutterCol = preset.shutterColor || preset.doorColor;
    const shutterMat = new BABYLON.StandardMaterial('shutterMat', scene);
    shutterMat.diffuseColor = new BABYLON.Color3(shutterCol.r, shutterCol.g, shutterCol.b);
    for (const wx of winXPositions) {
      for (let f = 0; f < floors; f++) {
        for (const sx of [-(winW / 2 + 0.02), (winW / 2 + 0.02)]) {
          const sh = BABYLON.MeshBuilder.CreateBox(`sh_${wx}_${f}_${sx}`, {
            width: 0.04, height: winH + 0.02, depth: 0.02,
          }, scene);
          const winY = porchElev + f * floorHeight + floorHeight * 0.55;
          sh.position.set(wx + sx, winY, bd / 2 + 0.012);
          sh.material = shutterMat;
        }
      }
    }
  }

  // Chimney
  if (hasChimney) {
    const chimneyMat = new BABYLON.StandardMaterial('chimneyMat', scene);
    chimneyMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.25);
    chimneyMat.specularColor = BABYLON.Color3.Black();
    const chimneyH = 0.35;
    const chimney = BABYLON.MeshBuilder.CreateBox('chimney', {
      width: 0.12, height: chimneyH, depth: 0.12,
    }, scene);
    chimney.position.set(bw * 0.3, bodyHeight + porchElev + chimneyH / 2, -bd * 0.2);
    chimney.material = chimneyMat;
  }

  // Building type label on the front face when no preset (generic fallback)
  if (!preset && buildingType) {
    const labelText = buildingType.replace(/([A-Z])/g, ' $1').trim();
    const dtWidth = 256;
    const dtHeight = 64;
    const dt = new BABYLON.DynamicTexture('labelTex', { width: dtWidth, height: dtHeight }, scene, false);
    const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, dtWidth, dtHeight);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, dtWidth / 2, dtHeight / 2);
    dt.update();

    const labelMat = new BABYLON.StandardMaterial('labelMat', scene);
    labelMat.diffuseTexture = dt;
    labelMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    labelMat.specularColor = BABYLON.Color3.Black();

    const labelW = Math.min(bw * 0.8, 0.6);
    const labelH = labelW * (dtHeight / dtWidth);
    const label = BABYLON.MeshBuilder.CreatePlane('typeLabel', {
      width: labelW, height: labelH,
    }, scene);
    label.position.set(0, bodyHeight * 0.6 + porchElev, bd / 2 + 0.015);
    label.material = labelMat;
  }

  // Auto-frame camera based on actual building dimensions
  const roofPeak = roofStyle === 'flat' ? 0.05 : 0.4;
  const totalH = bodyHeight + roofPeak + porchElev;
  const maxExtent = Math.max(bw, bd, totalH);
  camera.target = new BABYLON.Vector3(0, totalH / 2, 0);
  camera.radius = Math.max(2.5, maxExtent * 2.0);
  const groundScale = Math.max(bw, bd) * 1.5;
  ground.scaling = new BABYLON.Vector3(groundScale, groundScale, 1);
}

/** Resolve a visual asset ID to its file path */
export function resolveAssetPath(assetId: string | undefined, assets?: VisualAsset[]): string | undefined {
  if (!assetId || !assets?.length) return undefined;
  const asset = assets.find(a => a.id === assetId);
  if (!asset?.filePath) return undefined;
  return asset.filePath.startsWith('/') ? asset.filePath : `/${asset.filePath}`;
}

/** Lighting preset configurations matching spec: bright=1.5, dim=0.4, warm/cool=0.8, candlelit=0.3 */
export const LIGHTING_PRESET_CONFIGS: Record<string, { hemiIntensity: number; dirIntensity: number; color: [number, number, number] }> = {
  bright: { hemiIntensity: 1.5, dirIntensity: 0.8, color: [1, 1, 1] },
  dim: { hemiIntensity: 0.4, dirIntensity: 0.2, color: [0.9, 0.85, 0.8] },
  warm: { hemiIntensity: 0.8, dirIntensity: 0.4, color: [1.0, 0.75, 0.4] },
  cool: { hemiIntensity: 0.8, dirIntensity: 0.4, color: [0.6, 0.75, 1.0] },
  candlelit: { hemiIntensity: 0.3, dirIntensity: 0.1, color: [1.0, 0.7, 0.3] },
};

/** Build a procedural interior cutaway preview from an InteriorLayoutTemplate */
function buildProceduralInterior(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  ground: BABYLON.Mesh,
  template: InteriorLayoutTemplate,
  interiorConfig?: InteriorTemplateConfig,
  assets?: VisualAsset[],
) {
  // Normalize dimensions to fit nicely in the preview (target ~2 units)
  const maxDim = Math.max(template.width, template.depth);
  const scale = 2 / maxDim;
  const w = template.width * scale;
  const d = template.depth * scale;
  const h = template.height * scale;

  const { colors } = template;

  // Resolve texture paths from asset IDs
  const wallTexturePath = resolveAssetPath(interiorConfig?.wallTextureId, assets);
  const floorTexturePath = resolveAssetPath(interiorConfig?.floorTextureId, assets);
  const ceilingTexturePath = resolveAssetPath(interiorConfig?.ceilingTextureId, assets);

  // Floor
  const floorMat = new BABYLON.StandardMaterial('intFloorMat', scene);
  floorMat.diffuseColor = new BABYLON.Color3(colors.floor.r, colors.floor.g, colors.floor.b);
  floorMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  if (floorTexturePath) {
    const tex = new BABYLON.Texture(floorTexturePath, scene);
    tex.uScale = 2;
    tex.vScale = 2;
    floorMat.diffuseTexture = tex;
  }
  const floor = BABYLON.MeshBuilder.CreateBox('intFloor', { width: w, height: 0.03, depth: d }, scene);
  floor.position.y = 0;
  floor.material = floorMat;

  // Walls — three sides only (front open for cutaway view)
  const wallMat = new BABYLON.StandardMaterial('intWallMat', scene);
  wallMat.diffuseColor = new BABYLON.Color3(colors.wall.r, colors.wall.g, colors.wall.b);
  wallMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  if (wallTexturePath) {
    const tex = new BABYLON.Texture(wallTexturePath, scene);
    tex.uScale = 2;
    tex.vScale = 2;
    wallMat.diffuseTexture = tex;
  }
  const wallThickness = 0.03;

  // Back wall
  const backWall = BABYLON.MeshBuilder.CreateBox('intBackWall', { width: w, height: h, depth: wallThickness }, scene);
  backWall.position.set(0, h / 2, -d / 2);
  backWall.material = wallMat;

  // Left wall
  const leftWall = BABYLON.MeshBuilder.CreateBox('intLeftWall', { width: wallThickness, height: h, depth: d }, scene);
  leftWall.position.set(-w / 2, h / 2, 0);
  leftWall.material = wallMat;

  // Right wall
  const rightWall = BABYLON.MeshBuilder.CreateBox('intRightWall', { width: wallThickness, height: h, depth: d }, scene);
  rightWall.position.set(w / 2, h / 2, 0);
  rightWall.material = wallMat;

  // Ceiling
  const ceilingMat = new BABYLON.StandardMaterial('intCeilingMat', scene);
  ceilingMat.diffuseColor = new BABYLON.Color3(colors.ceiling.r, colors.ceiling.g, colors.ceiling.b);
  ceilingMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
  ceilingMat.alpha = 0.6; // Semi-transparent so interior is visible from above
  if (ceilingTexturePath) {
    const tex = new BABYLON.Texture(ceilingTexturePath, scene);
    tex.uScale = 2;
    tex.vScale = 2;
    ceilingMat.diffuseTexture = tex;
  }
  const ceiling = BABYLON.MeshBuilder.CreateBox('intCeiling', { width: w, height: 0.03, depth: d }, scene);
  ceiling.position.y = h;
  ceiling.material = ceilingMat;

  // Room partitions (ground floor only for preview clarity)
  const partitionMat = new BABYLON.StandardMaterial('intPartMat', scene);
  partitionMat.diffuseColor = wallMat.diffuseColor.scale(0.85);
  partitionMat.specularColor = BABYLON.Color3.Black();
  partitionMat.alpha = 0.6;

  const groundRooms = template.rooms.filter(r => r.floor === 0);
  for (let i = 1; i < groundRooms.length; i++) {
    const room = groundRooms[i];
    const resolved = resolveRoomZone(template, room);
    // Only add horizontal partitions (Z-axis splits)
    const partZ = (resolved.offsetZ - resolved.depth / 2) * scale;
    if (Math.abs(partZ) < d / 2 - 0.05) {
      const partition = BABYLON.MeshBuilder.CreateBox(`intPart_${i}`, {
        width: w * 0.95, height: h * 0.7, depth: wallThickness,
      }, scene);
      partition.position.set(0, h * 0.35, partZ);
      partition.material = partitionMat;
    }
  }

  // Determine furniture source — override template if furniture set is specified
  let furnitureTemplate = template;
  if (interiorConfig?.furnitureSet) {
    const overrideTemplate = INTERIOR_LAYOUT_TEMPLATES.find(
      t => t.id === interiorConfig.furnitureSet || t.buildingType === interiorConfig.furnitureSet,
    );
    if (overrideTemplate) furnitureTemplate = overrideTemplate;
  }

  // Furniture — place ground floor furniture as simple shapes
  for (const room of groundRooms) {
    const resolved = resolveRoomZone(template, room);
    // Try matching room function from furniture template; fall back to first set
    let furnEntries = getFurnitureSetForRoom(furnitureTemplate, room.function);
    if (furnEntries.length === 0 && furnitureTemplate !== template && furnitureTemplate.furnitureSets.length > 0) {
      furnEntries = furnitureTemplate.furnitureSets[0].furniture;
    }
    const roomCenterX = resolved.offsetX * scale;
    const roomCenterZ = resolved.offsetZ * scale;
    const roomW = resolved.width * scale;
    const roomD = resolved.depth * scale;

    for (const furn of furnEntries) {
      const fw = furn.width * scale;
      const fh = furn.height * scale;
      const fd = furn.depth * scale;
      const fx = roomCenterX + furn.offsetXFraction * roomW;
      const fz = roomCenterZ + furn.offsetZFraction * roomD;

      const mat = new BABYLON.StandardMaterial(`furnMat_${furn.type}_${Math.random().toFixed(3)}`, scene);
      mat.diffuseColor = new BABYLON.Color3(furn.color.r, furn.color.g, furn.color.b);
      mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

      const isCylinder = furn.type === 'barrel' || furn.type === 'stool' || furn.type === 'pillar';
      let mesh: BABYLON.Mesh;
      if (isCylinder) {
        mesh = BABYLON.MeshBuilder.CreateCylinder(`furn_${furn.type}`, {
          diameter: Math.max(fw, fd), height: fh, tessellation: 8,
        }, scene);
      } else {
        mesh = BABYLON.MeshBuilder.CreateBox(`furn_${furn.type}`, {
          width: fw, height: fh, depth: fd,
        }, scene);
      }
      mesh.position.set(fx, fh / 2, fz);
      if (furn.rotationY) mesh.rotation.y = furn.rotationY;
      mesh.material = mat;
    }
  }

  // Apply lighting preset
  if (interiorConfig?.lightingPreset) {
    const preset = LIGHTING_PRESET_CONFIGS[interiorConfig.lightingPreset];
    if (preset) {
      const hemi = scene.getLightByName('hemi') as BABYLON.HemisphericLight | null;
      const dir = scene.getLightByName('dir') as BABYLON.DirectionalLight | null;
      if (hemi) {
        hemi.intensity = preset.hemiIntensity;
        hemi.diffuse = new BABYLON.Color3(preset.color[0], preset.color[1], preset.color[2]);
      }
      if (dir) {
        dir.intensity = preset.dirIntensity;
        dir.diffuse = new BABYLON.Color3(preset.color[0], preset.color[1], preset.color[2]);
      }

      // Candlelit preset: add flickering point lights
      if (interiorConfig.lightingPreset === 'candlelit') {
        const candlePositions = [
          new BABYLON.Vector3(-w * 0.25, h * 0.4, -d * 0.25),
          new BABYLON.Vector3(w * 0.25, h * 0.4, d * 0.15),
        ];
        const candleLights: BABYLON.PointLight[] = [];
        for (let ci = 0; ci < candlePositions.length; ci++) {
          const candle = new BABYLON.PointLight(`candle_${ci}`, candlePositions[ci], scene);
          candle.diffuse = new BABYLON.Color3(1.0, 0.7, 0.3);
          candle.intensity = 0.5;
          candle.range = Math.max(w, d) * 1.5;
          candleLights.push(candle);
        }
        // Animate flickering
        scene.onBeforeRenderObservable.add(() => {
          for (const candle of candleLights) {
            candle.intensity = 0.4 + Math.random() * 0.25;
          }
        });
      }
    }
  }

  // Camera setup — isometric-ish angle looking into the cutaway
  camera.target = new BABYLON.Vector3(0, h * 0.3, 0);
  camera.alpha = Math.PI / 3;
  camera.beta = Math.PI / 3.5;
  camera.radius = Math.max(w, d) * 1.8;
  ground.scaling = new BABYLON.Vector3(w * 0.8, d * 0.8, 1);
}
