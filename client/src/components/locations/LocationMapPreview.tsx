import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
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

export function LocationMapPreview({
  viewLevel,
  countries,
  settlements,
  lots = [],
  businesses = [],
  residences = [],
  selectedCountryId,
  worldName = 'World',
  onSettlementClick,
  onCountryClick,
  className = '',
}: LocationMapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    if (viewLevel === 'world') {
      buildWorldView(scene, camera, advancedTexture, countries, settlements, pickableMap);
    } else if (viewLevel === 'country') {
      const countrySettlements = selectedCountryId
        ? settlements.filter(s => s.countryId === selectedCountryId)
        : settlements;
      const country = countries.find(c => c.id === selectedCountryId);
      buildCountryView(scene, camera, advancedTexture, countrySettlements, country, pickableMap);
    } else {
      buildSettlementView(scene, camera, advancedTexture, lots, businesses, residences);
    }

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
    setIsLoading(false);

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    // Also resize after a frame to handle initial layout
    requestAnimationFrame(() => engine.resize());

    return () => {
      window.removeEventListener('resize', onResize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
    };
  }, [viewLevel, countries, settlements, lots, businesses, residences, selectedCountryId]);

  return (
    <div className={`relative bg-black rounded-b-lg overflow-hidden ${className}`}>
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

  countries.forEach((country, i) => {
    const angle = (i / countryCount) * Math.PI * 2;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;

    // Country region disc
    const countrySettlements = settlements.filter(s => s.countryId === country.id);
    const regionSize = Math.max(3, Math.sqrt(countrySettlements.length + 1) * 2.5);

    const disc = BABYLON.MeshBuilder.CreateDisc(`country_${country.id}`, {
      radius: regionSize,
      tessellation: 24,
    }, scene);
    disc.rotation.x = Math.PI / 2;
    disc.position = new BABYLON.Vector3(cx, 0.02, cz);
    const discMat = new BABYLON.StandardMaterial(`countryMat_${i}`, scene);
    const rng = seededRandom(hashStr(country.id));
    discMat.diffuseColor = new BABYLON.Color3(
      0.2 + rng() * 0.3,
      0.3 + rng() * 0.3,
      0.15 + rng() * 0.2
    );
    discMat.specularColor = BABYLON.Color3.Black();
    discMat.alpha = 0.7;
    disc.material = discMat;
    disc.isPickable = true;
    pickableMap.set(disc.id, { type: 'country', data: country });

    // Country label
    addLabel(gui, disc, country.name, 14, 'white', 40);

    // Settlement markers within country region
    const settlementCount = countrySettlements.length;
    countrySettlements.forEach((s, si) => {
      const sAngle = (si / Math.max(settlementCount, 1)) * Math.PI * 2;
      const sRadius = regionSize * 0.5 * (0.4 + (hashStr(s.id) % 100) / 160);
      const sx = cx + Math.cos(sAngle) * sRadius;
      const sz = cz + Math.sin(sAngle) * sRadius;

      const scale = SETTLEMENT_SCALE[s.settlementType?.toLowerCase()] ?? 0.5;
      const color = getTerrainColor(s.terrain);

      const marker = BABYLON.MeshBuilder.CreateCylinder(`settlement_${s.id}`, {
        diameterTop: 0.15,
        diameterBottom: scale * 0.8,
        height: scale * 1.2,
        tessellation: 8,
      }, scene);
      marker.position = new BABYLON.Vector3(sx, scale * 0.6, sz);
      const markerMat = new BABYLON.StandardMaterial(`sMat_${si}`, scene);
      markerMat.diffuseColor = color;
      markerMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      marker.material = markerMat;
      marker.isPickable = true;
      pickableMap.set(marker.id, { type: 'settlement', data: s });

      addLabel(gui, marker, s.name, 10, '#ccc', 20);
    });
  });

  // Unaffiliated settlements
  const unaffiliated = settlements.filter(s => !s.countryId);
  if (unaffiliated.length > 0) {
    const ux = radius + 5;
    unaffiliated.forEach((s, si) => {
      const scale = SETTLEMENT_SCALE[s.settlementType?.toLowerCase()] ?? 0.5;
      const color = getTerrainColor(s.terrain);
      const marker = BABYLON.MeshBuilder.CreateCylinder(`settlement_${s.id}`, {
        diameterTop: 0.15,
        diameterBottom: scale * 0.8,
        height: scale * 1.2,
        tessellation: 8,
      }, scene);
      marker.position = new BABYLON.Vector3(ux, scale * 0.6, si * 2 - unaffiliated.length);
      const markerMat = new BABYLON.StandardMaterial(`uMat_${si}`, scene);
      markerMat.diffuseColor = color;
      marker.material = markerMat;
      marker.isPickable = true;
      pickableMap.set(marker.id, { type: 'settlement', data: s });
      addLabel(gui, marker, s.name, 10, '#aaa', 20);
    });
  }

  // Camera framing
  camera.target = BABYLON.Vector3.Zero();
  camera.radius = Math.max(radius * 2.5, 15);
}

// ─── Country View ────────────────────────────────────────────────────────────

function buildCountryView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  settlements: any[],
  country: any | undefined,
  pickableMap: Map<string, { type: 'settlement' | 'country'; data: any }>
) {
  // Ground plane with slight terrain tinting
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 40, height: 40 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.28, 0.15);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;

  if (settlements.length === 0) {
    camera.target = BABYLON.Vector3.Zero();
    camera.radius = 15;
    return;
  }

  // Layout settlements in a grid-like pattern
  const cols = Math.ceil(Math.sqrt(settlements.length));
  const spacing = 7;

  settlements.forEach((s, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cx = (col - (cols - 1) / 2) * spacing;
    const cz = (row - (Math.ceil(settlements.length / cols) - 1) / 2) * spacing;

    const scale = SETTLEMENT_SCALE[s.settlementType?.toLowerCase()] ?? 0.5;
    const terrainColor = getTerrainColor(s.terrain);
    const groundColor = getGroundColor(s.terrain);

    // Settlement ground patch
    const patch = BABYLON.MeshBuilder.CreateDisc(`patch_${s.id}`, {
      radius: 2.5 * scale + 1,
      tessellation: 16,
    }, scene);
    patch.rotation.x = Math.PI / 2;
    patch.position = new BABYLON.Vector3(cx, 0.01, cz);
    const patchMat = new BABYLON.StandardMaterial(`patchMat_${i}`, scene);
    patchMat.diffuseColor = groundColor;
    patchMat.specularColor = BABYLON.Color3.Black();
    patchMat.alpha = 0.6;
    patch.material = patchMat;

    // Building cluster - simple boxes representing buildings
    const rng = seededRandom(hashStr(s.id));
    const buildingCount = Math.max(3, Math.floor((s.population ?? 100) / 50 * scale));
    const clusterRadius = 1.5 * scale + 0.5;

    for (let b = 0; b < Math.min(buildingCount, 12); b++) {
      const bAngle = (b / buildingCount) * Math.PI * 2 + rng() * 0.5;
      const bDist = rng() * clusterRadius;
      const bx = cx + Math.cos(bAngle) * bDist;
      const bz = cz + Math.sin(bAngle) * bDist;
      const bHeight = 0.3 + rng() * 0.6 * scale;
      const bWidth = 0.2 + rng() * 0.3;

      const box = BABYLON.MeshBuilder.CreateBox(`bldg_${s.id}_${b}`, {
        width: bWidth,
        height: bHeight,
        depth: bWidth * (0.8 + rng() * 0.4),
      }, scene);
      box.position = new BABYLON.Vector3(bx, bHeight / 2, bz);
      const boxMat = new BABYLON.StandardMaterial(`bldgMat_${i}_${b}`, scene);
      boxMat.diffuseColor = new BABYLON.Color3(
        terrainColor.r * 0.7 + 0.2,
        terrainColor.g * 0.7 + 0.15,
        terrainColor.b * 0.7 + 0.1
      );
      boxMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      box.material = boxMat;
      box.isPickable = true;
      pickableMap.set(box.id, { type: 'settlement', data: s });
    }

    // Settlement label
    const labelAnchor = BABYLON.MeshBuilder.CreateBox(`anchor_${s.id}`, { size: 0.01 }, scene);
    labelAnchor.position = new BABYLON.Vector3(cx, 1.5, cz);
    labelAnchor.isVisible = false;
    labelAnchor.isPickable = false;

    const typeSuffix = s.settlementType ? ` (${s.settlementType})` : '';
    addLabel(gui, labelAnchor, `${s.name}${typeSuffix}`, 12, 'white', 30);
  });

  camera.target = BABYLON.Vector3.Zero();
  camera.radius = Math.max(cols * spacing * 0.8, 12);
}

// ─── Settlement View ─────────────────────────────────────────────────────────

function buildSettlementView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  lots: any[],
  businesses: any[],
  residences: any[]
) {
  // Ground plane
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.25, 0.3, 0.2);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;

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

      // Building color by type
      let color: BABYLON.Color3;
      let height: number;
      if (bType === 'business' || biz) {
        color = new BABYLON.Color3(0.55, 0.4, 0.25);
        height = 0.6 + rng() * 0.6;
      } else if (bType === 'residence' || res) {
        color = new BABYLON.Color3(0.4, 0.45, 0.6);
        height = 0.4 + rng() * 0.4;
      } else {
        color = new BABYLON.Color3(0.35, 0.35, 0.3);
        height = 0.15 + rng() * 0.15;
      }

      const width = 0.4 + rng() * 0.3;
      const depth = 0.4 + rng() * 0.3;

      const box = BABYLON.MeshBuilder.CreateBox(`lot_${lot.id}`, {
        width,
        height,
        depth,
      }, scene);
      box.position = new BABYLON.Vector3(lx, height / 2, lz);
      const boxMat = new BABYLON.StandardMaterial(`lotMat_${li}`, scene);
      boxMat.diffuseColor = color;
      boxMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
      box.material = boxMat;

      // Roof for non-vacant
      if (bType !== 'vacant') {
        const roof = BABYLON.MeshBuilder.CreateCylinder(`roof_${lot.id}`, {
          diameterTop: 0,
          diameterBottom: Math.max(width, depth) * 1.3,
          height: 0.25,
          tessellation: 4,
        }, scene);
        roof.position = new BABYLON.Vector3(lx, height + 0.125, lz);
        roof.rotation.y = Math.PI / 4;
        const roofMat = new BABYLON.StandardMaterial(`roofMat_${li}`, scene);
        roofMat.diffuseColor = biz
          ? new BABYLON.Color3(0.6, 0.3, 0.15)
          : new BABYLON.Color3(0.3, 0.3, 0.5);
        roofMat.specularColor = BABYLON.Color3.Black();
        roof.material = roofMat;
      }

      // Building label
      const label = biz?.name ?? lot.address ?? `Lot ${li + 1}`;
      addLabel(gui, box, label, 9, biz ? '#FFB86C' : res ? '#8BE9FD' : '#aaa', 15);
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
