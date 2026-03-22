import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
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
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const autoRotateRef = useRef(true);

  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
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
              buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset);
              setMeshSource('placeholder');
            }
          } else {
            buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset);
            setMeshSource('placeholder');
          }
          setIsLoading(false);
        },
        undefined,
        () => {
          buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset);
          setMeshSource('placeholder');
          setIsLoading(false);
        }
      );
    } else if (viewMode === 'interior') {
      if (interiorTemplate) {
        buildProceduralInterior(scene, camera, ground, interiorTemplate, interiorConfig, interiorAssets);
      } else {
        // No specific template — generate a basic default interior
        const defaultTemplate: InteriorLayoutTemplate = {
          id: 'default',
          buildingType: buildingType || 'default',
          matchBusinessTypes: [],
          width: 10,
          depth: 8,
          height: 3,
          floorCount: 1,
          colors: {
            wall: { r: 0.85, g: 0.82, b: 0.75 },
            floor: { r: 0.45, g: 0.35, b: 0.25 },
            ceiling: { r: 0.9, g: 0.88, b: 0.85 },
          },
          rooms: [{
            name: 'Main Room',
            function: 'living',
            offsetXFraction: 0,
            offsetZFraction: 0,
            widthFraction: 0.9,
            depthFraction: 0.9,
            floor: 0,
          }],
          furnitureSets: [],
        };
        buildProceduralInterior(scene, camera, ground, defaultTemplate, interiorConfig, interiorAssets);
      }
      setMeshSource('model');
      setIsLoading(false);
    } else {
      buildProceduralPlaceholder(scene, camera, ground, tintColor, resolvedPreset);
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

  // Resolve whether we have any interior to show (model or procedural template)
  const resolvedInteriorTemplate = buildingType
    ? getTemplateForBuildingType(buildingType, businessType)
    : undefined;
  const hasInterior = !!interiorModelPath || !!resolvedInteriorTemplate;

  const sourceLabel = viewMode === 'interior'
    ? (meshSource === 'model' ? 'Interior' : 'No Interior')
    : (meshSource === 'model' ? (buildingType || '3D Model') : 'Placeholder');

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
      <div className="relative bg-black rounded-lg overflow-hidden flex-1">
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

            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 bg-black/50 hover:bg-black/70"
                onClick={() => setAutoRotate(!autoRotate)}
                title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
              >
                <RotateCcw className={`h-3 w-3 ${autoRotate ? 'text-blue-400' : 'text-white'}`} />
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

/** Resolve a style preset from the procedural config for preview rendering */
function resolvePresetForPreview(
  config?: ProceduralBuildingConfig | null,
  buildingType?: string,
  zone?: 'commercial' | 'residential',
): ProceduralStylePreset | null {
  if (!config || config.stylePresets.length === 0) return null;

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

  // Random from all presets
  return config.stylePresets[0];
}

function buildProceduralPlaceholder(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  ground: BABYLON.Mesh,
  tintColor?: { r: number; g: number; b: number },
  preset?: ProceduralStylePreset | null,
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

  const mat = new BABYLON.StandardMaterial('placeholderMat', scene);
  mat.diffuseColor = wallColor;
  mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);

  const hasPorch = preset?.hasPorch ?? false;
  const hasBalcony = preset?.hasIronworkBalcony || preset?.hasBalcony;
  const floors = hasBalcony ? 2 : 1;
  const bodyHeight = floors * 0.6;
  const porchElev = hasPorch ? 0.15 : 0;

  // Building body
  const body = BABYLON.MeshBuilder.CreateBox('body', {
    width: 1, height: bodyHeight, depth: 1,
  }, scene);
  body.position.y = bodyHeight / 2 + porchElev;
  body.material = mat;

  // Roof — proper gable shape using custom vertices
  const roofMat = new BABYLON.StandardMaterial('roofMat', scene);
  roofMat.diffuseColor = roofColor;
  roofMat.specularColor = BABYLON.Color3.Black();

  const roofHeight = 0.4;
  const hw = 0.6; // half-width with overhang
  const hd = hasPorch ? 0.7 : 0.6;
  const frontHd = hasPorch ? 0.95 : hd;
  const roofMesh = new BABYLON.Mesh('roof', scene);
  const ridgeInset = Math.min(hw * 0.5, hd * 0.5);
  const ridgeHalfLen = hw - ridgeInset;
  const positions = [
    -hw, 0, frontHd,  hw, 0, frontHd,  hw, 0, -hd,  -hw, 0, -hd,
    -ridgeHalfLen, roofHeight, 0,  ridgeHalfLen, roofHeight, 0,
  ];
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
  roofMesh.position.y = bodyHeight + porchElev;
  roofMesh.material = roofMat;

  // Porch
  if (hasPorch) {
    const porchMat = new BABYLON.StandardMaterial('porchMat', scene);
    porchMat.diffuseColor = wallColor.scale(0.75);
    porchMat.specularColor = BABYLON.Color3.Black();

    // Foundation
    const foundation = BABYLON.MeshBuilder.CreateBox('porchFound', {
      width: 1.1, height: porchElev, depth: 0.35,
    }, scene);
    foundation.position.y = porchElev / 2;
    foundation.position.z = 0.5 + 0.175;
    foundation.material = porchMat;

    // Porch deck
    const deck = BABYLON.MeshBuilder.CreateBox('porchDeck', {
      width: 1.1, height: 0.03, depth: 0.35,
    }, scene);
    deck.position.y = porchElev;
    deck.position.z = 0.5 + 0.175;
    deck.material = porchMat;

    // Posts
    const postMat = new BABYLON.StandardMaterial('postMat', scene);
    postMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.88);
    for (const x of [-0.4, 0.4]) {
      const post = BABYLON.MeshBuilder.CreateCylinder(`post_${x}`, {
        diameter: 0.04, height: 0.55, tessellation: 6,
      }, scene);
      post.position.set(x, porchElev + 0.275, 0.65);
      post.material = postMat;
    }
  }

  // Ironwork balcony
  if (hasBalcony && floors > 1) {
    const ironMat = new BABYLON.StandardMaterial('ironMat', scene);
    ironMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    const balcSlab = BABYLON.MeshBuilder.CreateBox('balcSlab', {
      width: 0.95, height: 0.03, depth: 0.2,
    }, scene);
    balcSlab.position.y = 0.6 + porchElev;
    balcSlab.position.z = 0.6;
    balcSlab.material = ironMat;

    const balcRail = BABYLON.MeshBuilder.CreateBox('balcRail', {
      width: 0.95, height: 0.15, depth: 0.02,
    }, scene);
    balcRail.position.y = 0.72 + porchElev;
    balcRail.position.z = 0.7;
    balcRail.material = ironMat;
  }

  // Shutters
  if (preset?.hasShutters) {
    const shutterCol = preset.shutterColor || preset.doorColor;
    const shutterMat = new BABYLON.StandardMaterial('shutterMat', scene);
    shutterMat.diffuseColor = new BABYLON.Color3(shutterCol.r, shutterCol.g, shutterCol.b);
    for (const x of [-0.25, 0.25]) {
      for (let f = 0; f < floors; f++) {
        for (const sx of [-0.12, 0.12]) {
          const sh = BABYLON.MeshBuilder.CreateBox(`sh_${x}_${f}_${sx}`, {
            width: 0.05, height: 0.18, depth: 0.02,
          }, scene);
          sh.position.set(x + sx, f * 0.6 + 0.35 + porchElev, 0.52);
          sh.material = shutterMat;
        }
      }
    }
  }

  const totalH = bodyHeight + roofHeight + porchElev;
  camera.target = new BABYLON.Vector3(0, totalH / 2, 0);
  camera.radius = Math.max(3, totalH * 2);
  ground.scaling = new BABYLON.Vector3(2, 2, 1);
}

/** Resolve a visual asset ID to its file path */
function resolveAssetPath(assetId: string | undefined, assets?: VisualAsset[]): string | undefined {
  if (!assetId || !assets?.length) return undefined;
  const asset = assets.find(a => a.id === assetId);
  if (!asset?.filePath) return undefined;
  return asset.filePath.startsWith('/') ? asset.filePath : `/${asset.filePath}`;
}

/** Lighting preset configurations */
const LIGHTING_PRESET_CONFIGS: Record<string, { hemiIntensity: number; dirIntensity: number; color: [number, number, number] }> = {
  bright: { hemiIntensity: 1.0, dirIntensity: 0.6, color: [1, 1, 1] },
  dim: { hemiIntensity: 0.3, dirIntensity: 0.15, color: [0.9, 0.85, 0.8] },
  warm: { hemiIntensity: 0.7, dirIntensity: 0.4, color: [1.0, 0.85, 0.6] },
  cool: { hemiIntensity: 0.7, dirIntensity: 0.4, color: [0.7, 0.8, 1.0] },
  candlelit: { hemiIntensity: 0.2, dirIntensity: 0.1, color: [1.0, 0.7, 0.3] },
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
    }
  }

  // Camera setup — isometric-ish angle looking into the cutaway
  camera.target = new BABYLON.Vector3(0, h * 0.3, 0);
  camera.alpha = Math.PI / 3;
  camera.beta = Math.PI / 3.5;
  camera.radius = Math.max(w, d) * 1.8;
  ground.scaling = new BABYLON.Vector3(w * 0.8, d * 0.8, 1);
}
