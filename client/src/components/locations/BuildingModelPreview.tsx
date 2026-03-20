import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BuildingModelPreviewProps {
  /** Direct path to the 3D model file */
  modelPath?: string | null;
  /** Tint color for the building type (business=orange, residence=blue) */
  tintColor?: { r: number; g: number; b: number };
  /** Label shown in the badge */
  buildingType?: string;
  className?: string;
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
  tintColor,
  buildingType,
  className = '',
}: BuildingModelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const autoRotateRef = useRef(true);

  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [meshSource, setMeshSource] = useState<'model' | 'placeholder'>('placeholder');

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

    if (modelPath) {
      setIsLoading(true);
      const fullPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
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
            // Strip environment meshes
            const envMeshes = meshes.filter(m => isEnvMesh(m.name));
            for (const m of envMeshes) m.dispose();
            const remaining = meshes.filter(m => !m.isDisposed());

            if (remaining.length > 0) {
              centerAndFrameMeshes(remaining, camera, ground);
              setMeshSource('model');
            } else {
              buildPlaceholder(scene, camera, ground, tintColor);
              setMeshSource('placeholder');
            }
          } else {
            buildPlaceholder(scene, camera, ground, tintColor);
            setMeshSource('placeholder');
          }
          setIsLoading(false);
        },
        undefined,
        () => {
          buildPlaceholder(scene, camera, ground, tintColor);
          setMeshSource('placeholder');
          setIsLoading(false);
        }
      );
    } else {
      buildPlaceholder(scene, camera, ground, tintColor);
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
  }, [modelPath, tintColor?.r, tintColor?.g, tintColor?.b]);

  const handleZoomIn = () => {
    if (cameraRef.current) cameraRef.current.radius = Math.max(1, cameraRef.current.radius - 0.8);
  };
  const handleZoomOut = () => {
    if (cameraRef.current) cameraRef.current.radius = Math.min(20, cameraRef.current.radius + 0.8);
  };

  const sourceLabel = meshSource === 'model' ? (buildingType || '3D Model') : 'Placeholder';

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
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

function buildPlaceholder(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  ground: BABYLON.Mesh,
  tintColor?: { r: number; g: number; b: number }
) {
  const color = tintColor
    ? new BABYLON.Color3(tintColor.r, tintColor.g, tintColor.b)
    : new BABYLON.Color3(0.45, 0.45, 0.4);

  const mat = new BABYLON.StandardMaterial('placeholderMat', scene);
  mat.diffuseColor = color;
  mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  // Building body
  const body = BABYLON.MeshBuilder.CreateBox('body', {
    width: 1,
    height: 1.2,
    depth: 1,
  }, scene);
  body.position.y = 0.6;
  body.material = mat;

  // Roof
  const roofMat = new BABYLON.StandardMaterial('roofMat', scene);
  roofMat.diffuseColor = color.scale(0.7);
  roofMat.specularColor = BABYLON.Color3.Black();

  const roof = BABYLON.MeshBuilder.CreateCylinder('roof', {
    diameterTop: 0,
    diameterBottom: 1.5,
    height: 0.5,
    tessellation: 4,
  }, scene);
  roof.position.y = 1.45;
  roof.rotation.y = Math.PI / 4;
  roof.material = roofMat;

  camera.target = new BABYLON.Vector3(0, 0.7, 0);
  camera.radius = 4;
  ground.scaling = new BABYLON.Vector3(1.5, 1.5, 1);
}
