import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DEFAULT_NPC_MODEL = '/assets/npc/starterAvatars.babylon';

interface CharacterModelPreviewProps {
  modelPath?: string | null;
  texturePath?: string | null;
  className?: string;
}

export function CharacterModelPreview({
  modelPath,
  texturePath,
  className = '',
}: CharacterModelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const autoRotateRef = useRef(true);

  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [meshSource, setMeshSource] = useState<'custom' | 'default' | 'placeholder'>('default');

  // Keep ref in sync with state
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.06, 0.06, 0.1, 1);
    sceneRef.current = scene;

    // Camera
    const camera = new BABYLON.ArcRotateCamera('cam', Math.PI / 4, Math.PI / 3, 4, new BABYLON.Vector3(0, 0.8, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 15;
    camera.wheelPrecision = 60;
    cameraRef.current = camera;

    // Lighting
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.8;
    const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-1, -2, -1), scene);
    dir.intensity = 0.4;

    // Ground disc
    const ground = BABYLON.MeshBuilder.CreateDisc('ground', { radius: 1.2, tessellation: 32 }, scene);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.01;
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.18);
    groundMat.specularColor = BABYLON.Color3.Black();
    ground.material = groundMat;

    // Auto-rotate observer (reads from ref)
    scene.onBeforeRenderObservable.add(() => {
      if (autoRotateRef.current) camera.alpha += 0.005;
    });

    // Try loading a model
    const resolvedPath = modelPath || DEFAULT_NPC_MODEL;
    const isCustom = !!modelPath;
    setIsLoading(true);

    const fullPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;
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
          centerAndFrameMeshes(meshes, camera, ground);
          if (texturePath) applyTexture(scene, meshes, texturePath);
          setMeshSource(isCustom ? 'custom' : 'default');
        } else {
          buildPlaceholder(scene, camera, ground);
          setMeshSource('placeholder');
        }
        setIsLoading(false);
      },
      undefined,
      () => {
        // Load failed — try default if we were loading a custom model
        if (isCustom) {
          tryDefaultModel(scene, camera, ground, texturePath ?? null);
        } else {
          buildPlaceholder(scene, camera, ground);
          setMeshSource('placeholder');
          setIsLoading(false);
        }
      }
    );

    const tryDefaultModel = (
      sc: BABYLON.Scene,
      cam: BABYLON.ArcRotateCamera,
      gnd: BABYLON.Mesh,
      txPath: string | null
    ) => {
      const defParts = DEFAULT_NPC_MODEL.split('/');
      const defFile = defParts.pop() || '';
      const defRoot = defParts.join('/') + '/';
      BABYLON.SceneLoader.ImportMesh(
        '',
        defRoot,
        defFile,
        sc,
        (meshes) => {
          if (meshes.length > 0) {
            centerAndFrameMeshes(meshes, cam, gnd);
            if (txPath) applyTexture(sc, meshes, txPath);
            setMeshSource('default');
          } else {
            buildPlaceholder(sc, cam, gnd);
            setMeshSource('placeholder');
          }
          setIsLoading(false);
        },
        undefined,
        () => {
          buildPlaceholder(sc, cam, gnd);
          setMeshSource('placeholder');
          setIsLoading(false);
        }
      );
    };

    // Render loop
    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [modelPath, texturePath]);

  const handleZoomIn = () => {
    if (cameraRef.current) cameraRef.current.radius = Math.max(1, cameraRef.current.radius - 0.8);
  };
  const handleZoomOut = () => {
    if (cameraRef.current) cameraRef.current.radius = Math.min(15, cameraRef.current.radius + 0.8);
  };

  const sourceLabel = meshSource === 'custom' ? 'Custom model' : meshSource === 'default' ? 'Default NPC' : 'Placeholder';

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
          {/* Source badge */}
          <Badge variant="secondary" className="absolute top-2 left-2 text-xs bg-black/50 text-white border-none">
            {sourceLabel}
          </Badge>

          {/* Controls */}
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

  // Shift model so feet are at y=0 and centered on x/z
  meshes.forEach(m => {
    if (m.parent === null) {
      m.position.x -= center.x;
      m.position.z -= center.z;
      m.position.y -= min.y;
    }
  });

  camera.target = new BABYLON.Vector3(0, size.y / 2, 0);
  camera.radius = maxDim * 1.8;
  ground.scaling = new BABYLON.Vector3(maxDim * 0.7, maxDim * 0.7, 1);
}

function buildPlaceholder(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  ground: BABYLON.Mesh
) {
  const mat = new BABYLON.StandardMaterial('placeholderMat', scene);
  mat.diffuseColor = new BABYLON.Color3(0.35, 0.5, 0.85);
  mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  // Body capsule
  const body = BABYLON.MeshBuilder.CreateCapsule('body', {
    height: 1.4,
    radius: 0.28,
    tessellation: 16,
    subdivisions: 4,
  }, scene);
  body.position.y = 0.7;
  body.material = mat;

  // Head sphere
  const head = BABYLON.MeshBuilder.CreateSphere('head', { diameter: 0.42, segments: 16 }, scene);
  head.position.y = 1.65;
  head.material = mat;

  camera.target = new BABYLON.Vector3(0, 0.85, 0);
  camera.radius = 3.5;
  ground.scaling = new BABYLON.Vector3(1, 1, 1);
}

function applyTexture(scene: BABYLON.Scene, meshes: BABYLON.AbstractMesh[], texturePath: string) {
  const path = texturePath.startsWith('/') ? texturePath : `/${texturePath}`;
  const texture = new BABYLON.Texture(path, scene);
  meshes.forEach(mesh => {
    if (!mesh.material) return;
    if (mesh.material instanceof BABYLON.StandardMaterial) {
      mesh.material.diffuseTexture = texture;
    } else if (mesh.material instanceof BABYLON.PBRMaterial) {
      mesh.material.albedoTexture = texture;
    }
  });
}
