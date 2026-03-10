import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import * as GUI from '@babylonjs/gui';
import { Loader2 } from 'lucide-react';

export type ViewLevel = 'world' | 'country' | 'settlement';

interface LocationMapPreviewProps {
  viewLevel: ViewLevel;
  countries: any[];
  settlements: any[];
  lots?: any[];
  businesses?: any[];
  residences?: any[];
  selectedCountryId?: string | null;
  worldId?: string;
  worldName?: string;
  onSettlementClick?: (settlement: any) => void;
  onCountryClick?: (country: any) => void;
  className?: string;
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
};

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

export function LocationMapPreview({
  viewLevel,
  countries,
  settlements,
  lots = [],
  businesses = [],
  residences = [],
  selectedCountryId,
  worldId,
  worldName = 'World',
  onSettlementClick,
  onCountryClick,
  className = '',
}: LocationMapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.08, 0.1, 0.14, 1);

    // Camera - more top-down for world, more angled for settlement
    const betaAngle =
      viewLevel === 'world' ? Math.PI / 4.5 :
      viewLevel === 'country' ? Math.PI / 4 :
      Math.PI / 3.5;

    const camera = new BABYLON.ArcRotateCamera(
      'cam',
      -Math.PI / 4,
      betaAngle,
      20,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 80;
    camera.wheelPrecision = 30;
    camera.panningSensibility = 50;

    // Lighting
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0.3, 1, 0.2), scene);
    hemi.intensity = 0.75;
    const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-1, -2, -1), scene);
    dir.intensity = 0.45;

    // GUI for labels
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);

    // Picking support
    const pickableMap = new Map<string, { type: 'settlement' | 'country'; data: any }>();

    let disposed = false;

    const buildScene = async () => {
      if (viewLevel === 'world') {
        buildWorldView(scene, camera, advancedTexture, countries, settlements, pickableMap);
      } else if (viewLevel === 'country') {
        const countrySettlements = selectedCountryId
          ? settlements.filter(s => s.countryId === selectedCountryId)
          : settlements;
        const country = countries.find(c => c.id === selectedCountryId);
        buildCountryView(scene, camera, advancedTexture, countrySettlements, country, pickableMap);
      } else {
        const onProgress = (loaded: number, total: number) => {
          if (!disposed) setLoadingProgress(`Loading models ${loaded}/${total}...`);
        };
        await buildSettlementView(scene, camera, advancedTexture, lots, businesses, residences, worldId, onProgress);
      }

      if (!disposed) {
        setIsLoading(false);
        setLoadingProgress(null);
      }
    };

    buildScene();

    // Click handling
    scene.onPointerDown = (_evt, pickResult) => {
      if (pickResult?.hit && pickResult.pickedMesh) {
        const id = pickResult.pickedMesh.id;
        const entry = pickableMap.get(id);
        if (entry?.type === 'settlement' && onSettlementClick) {
          onSettlementClick(entry.data);
        } else if (entry?.type === 'country' && onCountryClick) {
          onCountryClick(entry.data);
        }
      }
    };

    // Slow auto-rotate
    scene.onBeforeRenderObservable.add(() => {
      camera.alpha += 0.001;
    });

    engine.runRenderLoop(() => scene.render());

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    // Also resize after a frame to handle initial layout
    requestAnimationFrame(() => engine.resize());

    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
    };
  }, [viewLevel, countries, settlements, lots, businesses, residences, selectedCountryId, worldId]);

  return (
    <div className={`relative bg-black rounded-b-lg overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
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

// ─── World View ──────────────────────────────────────────────────────────────

function buildWorldView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  countries: any[],
  settlements: any[],
  pickableMap: Map<string, { type: 'settlement' | 'country'; data: any }>
) {
  // Ground plane
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 60, height: 60 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.2, 0.12);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;

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

    // Country name
    const anchor = BABYLON.MeshBuilder.CreateBox(`cAnchor_${ci}`, { size: 0.01 }, scene);
    anchor.position = new BABYLON.Vector3(cx, 3.5, cz);
    anchor.isVisible = false;
    anchor.isPickable = false;
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

      addLabel(gui, marker, s.name, 10, '#CCC', 20);
    });
  });

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
  pickableMap: Map<string, { type: 'settlement' | 'country'; data: any }>
) {
  const terrain = country?.terrain ?? 'plains';
  const groundCol = getGroundColor(terrain);
  const buildingCol = getTerrainColor(terrain);

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 40, height: 40 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = groundCol;
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;

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
    }

    // Settlement label and picker
    const marker = BABYLON.MeshBuilder.CreateBox(`sMarker_${si}`, { size: 0.01 }, scene);
    marker.position = new BABYLON.Vector3(sx, 2, sz);
    marker.isVisible = false;
    marker.id = `settlement_pick_${s.id}`;
    pickableMap.set(marker.id, { type: 'settlement', data: s });
    addLabel(gui, marker, s.name, 12, '#FFF', 0);
  });

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

async function buildSettlementView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  lots: any[],
  businesses: any[],
  residences: any[],
  worldId?: string,
  onProgress?: (loaded: number, total: number) => void
) {
  // Ground plane
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.25, 0.3, 0.2);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;

  // Load model prototypes if worldId is available
  let prototypes = new Map<string, ModelPrototype>();
  if (worldId) {
    prototypes = await loadModelPrototypes(scene, worldId, onProgress);
  }

  // Scene may have been disposed during async loading
  if (scene.isDisposed) return;

  // Group lots by district
  const districts = new Map<string, any[]>();
  lots.forEach(l => {
    const district = l.districtName || 'Main';
    if (!districts.has(district)) districts.set(district, []);
    districts.get(district)!.push(l);
  });

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

  const districtArray = Array.from(districts.entries());
  const districtCount = districtArray.length || 1;
  const districtSpacing = 8;
  const cols = Math.ceil(Math.sqrt(districtCount));

  districtArray.forEach(([districtName, districtLots], di) => {
    const dRow = Math.floor(di / cols);
    const dCol = di % cols;
    const dx = (dCol - (cols - 1) / 2) * districtSpacing;
    const dz = (dRow - (Math.ceil(districtCount / cols) - 1) / 2) * districtSpacing;

    // District ground
    const dRadius = Math.max(2, Math.sqrt(districtLots.length) * 1.2);
    const disc = BABYLON.MeshBuilder.CreateDisc(`district_${di}`, {
      radius: dRadius,
      tessellation: 20,
    }, scene);
    disc.rotation.x = Math.PI / 2;
    disc.position = new BABYLON.Vector3(dx, 0.01, dz);
    const discMat = new BABYLON.StandardMaterial(`distMat_${di}`, scene);
    discMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.25);
    discMat.specularColor = BABYLON.Color3.Black();
    discMat.alpha = 0.5;
    disc.material = discMat;

    // District label
    const distLabel = BABYLON.MeshBuilder.CreateBox(`distAnchor_${di}`, { size: 0.01 }, scene);
    distLabel.position = new BABYLON.Vector3(dx, 2.0, dz);
    distLabel.isVisible = false;
    distLabel.isPickable = false;
    addLabel(gui, distLabel, districtName, 11, '#FFD700', 25);

    // Layout lots within district
    const lotCols = Math.ceil(Math.sqrt(districtLots.length));
    const lotSpacing = 1.4;

    districtLots.forEach((lot, li) => {
      const lRow = Math.floor(li / lotCols);
      const lCol = li % lotCols;
      const lx = dx + (lCol - (lotCols - 1) / 2) * lotSpacing;
      const lz = dz + (lRow - (Math.ceil(districtLots.length / lotCols) - 1) / 2) * lotSpacing;

      const rng = seededRandom(hashStr(lot.id));
      const bType = lot.buildingType?.toLowerCase() ?? 'vacant';
      const biz = bizByLot.get(lot.id);
      const res = resByLot.get(lot.id);

      const isBusiness = bType === 'business' || !!biz;
      const isResidence = bType === 'residence' || !!res;

      // Determine building type for role mapping
      const buildingType = isBusiness ? 'business' : isResidence ? 'residence' : 'vacant';
      const businessType = biz?.businessType || (isResidence ? 'residence_small' : undefined);
      const role = buildingType !== 'vacant' ? getModelRole(buildingType, businessType) : null;

      // Tint colors for type identification
      const tintColor = isBusiness
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

      if (prototype && buildingType !== 'vacant') {
        // Create parent mesh at the lot position
        const parent = new BABYLON.Mesh(`lot_parent_${lot.id}`, scene);
        parent.position = new BABYLON.Vector3(lx, 0, lz);
        parent.rotation.y = rng() * Math.PI * 2;

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

        // Label
        const label = biz?.name ?? lot.address ?? `Lot ${li + 1}`;
        addLabel(gui, parent, label, 9, isBusiness ? '#FFB86C' : isResidence ? '#8BE9FD' : '#aaa', 15);
      } else {
        // Fallback: primitive box + cone roof
        const width = 0.4 + rng() * 0.3;
        const depth = 0.4 + rng() * 0.3;

        const box = BABYLON.MeshBuilder.CreateBox(`lot_${lot.id}`, {
          width,
          height,
          depth,
        }, scene);
        box.position = new BABYLON.Vector3(lx, height / 2, lz);
        const boxMat = new BABYLON.StandardMaterial(`lotMat_${li}`, scene);
        boxMat.diffuseColor = tintColor;
        boxMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
        box.material = boxMat;

        // Roof for non-vacant
        if (buildingType !== 'vacant') {
          const roof = BABYLON.MeshBuilder.CreateCylinder(`roof_${lot.id}`, {
            diameterTop: 0,
            diameterBottom: Math.max(width, depth) * 1.3,
            height: 0.25,
            tessellation: 4,
          }, scene);
          roof.position = new BABYLON.Vector3(lx, height + 0.125, lz);
          roof.rotation.y = Math.PI / 4;
          const roofMat = new BABYLON.StandardMaterial(`roofMat_${li}`, scene);
          roofMat.diffuseColor = isBusiness
            ? new BABYLON.Color3(0.6, 0.3, 0.15)
            : new BABYLON.Color3(0.3, 0.3, 0.5);
          roofMat.specularColor = BABYLON.Color3.Black();
          roof.material = roofMat;
        }

        // Building label
        const label = biz?.name ?? lot.address ?? `Lot ${li + 1}`;
        addLabel(gui, box, label, 9, isBusiness ? '#FFB86C' : isResidence ? '#8BE9FD' : '#aaa', 15);
      }
    });
  });

  // If no lots, show placeholder
  if (lots.length === 0) {
    const anchor = BABYLON.MeshBuilder.CreateBox('empty', { size: 0.01 }, scene);
    anchor.position = new BABYLON.Vector3(0, 1, 0);
    anchor.isVisible = false;
    addLabel(gui, anchor, 'No lots or buildings', 14, '#888', 0);
  }

  camera.target = BABYLON.Vector3.Zero();
  const extent = Math.max(cols * districtSpacing * 0.7, 8);
  camera.radius = extent;
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
}
