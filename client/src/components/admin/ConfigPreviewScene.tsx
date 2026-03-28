import { useRef, useEffect, useCallback, useState } from "react";
import { Maximize, Minimize, ZoomIn, ZoomOut, Pause, Play } from "lucide-react";

/**
 * Lightweight Babylon.js preview scene for config panels.
 * Renders a small 3D viewport with a ground plane and optional model.
 * Used by Building, Ground, Character, Nature, and Item config panels.
 */

interface ConfigPreviewSceneProps {
  /** Asset file path (relative) to load as a 3D model */
  modelPath?: string;
  /** Additional model paths to load and attach to the root (for composite preview) */
  additionalModelPaths?: string[];
  /** Ground color as hex string */
  groundColor?: string;
  /** Whether to show a ground disc */
  showGround?: boolean;
  /** Whether to auto-rotate the camera */
  autoRotate?: boolean;
  /** Height of the preview canvas */
  height?: number;
  /** Optional className */
  className?: string;
  /** Callback with the Babylon scene for custom setup */
  onSceneReady?: (scene: any, engine: any) => void;
  /** Procedural builder callback — build meshes instead of loading a model.
   *  Receives the Babylon.js scene and the BABYLON module for mesh creation. */
  buildProcedural?: (scene: any, BABYLON: any) => void;
}

// Names of meshes that are part of the scene infrastructure (not user content)
const INFRASTRUCTURE_NAMES = new Set(["ground", "cam", "hemi", "dir"]);

export function ConfigPreviewScene({
  modelPath,
  additionalModelPaths,
  groundColor = "#4a5568",
  showGround = true,
  autoRotate = true,
  height = 200,
  className = "",
  onSceneReady,
  buildProcedural,
}: ConfigPreviewSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const babylonRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const buildProceduralRef = useRef(buildProcedural);
  const isRotatingRef = useRef(autoRotate);

  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep ref up to date without triggering re-setup
  buildProceduralRef.current = buildProcedural;

  // One-time engine/scene setup (only depends on structural props)
  const setup = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dynamic import to avoid SSR issues
    const BABYLON = await import("@babylonjs/core");
    await import("@babylonjs/loaders/glTF");
    babylonRef.current = BABYLON;

    // Cleanup previous
    if (engineRef.current) {
      engineRef.current.dispose();
    }

    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0.12, 0.12, 0.15, 1);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
      "cam", Math.PI / 4, Math.PI / 3, 5, BABYLON.Vector3.Zero(), scene
    );
    cameraRef.current = camera;
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;
    camera.wheelPrecision = 50;

    // Auto-rotate controlled by ref so toggling doesn't rebuild scene
    scene.onBeforeRenderObservable.add(() => {
      if (isRotatingRef.current) camera.alpha += 0.005;
    });

    // Lighting
    const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.7;
    const dirLight = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-1, -2, 1), scene);
    dirLight.intensity = 0.5;

    // Ground
    if (showGround) {
      const ground = BABYLON.MeshBuilder.CreateDisc("ground", { radius: 3 }, scene);
      ground.rotation.x = Math.PI / 2;
      ground.position.y = -0.01;
      const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
      const parsed = BABYLON.Color3.FromHexString(groundColor);
      groundMat.diffuseColor = parsed;
      groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
      ground.material = groundMat;
    }

    // Custom scene setup callback
    if (onSceneReady) {
      onSceneReady(scene, engine);
    }

    // Build procedural meshes (initial)
    if (buildProceduralRef.current) {
      buildProceduralRef.current(scene, BABYLON);
      const meshes = scene.meshes.filter((m: any) => !INFRASTRUCTURE_NAMES.has(m.name));
      if (meshes.length > 0) {
        frameMeshes(camera, meshes, BABYLON);
      }
    }

    // Load model if provided
    if (modelPath && !buildProceduralRef.current) {
      try {
        const fullPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
        const pathParts = fullPath.split('/');
        const fileName = pathParts.pop() || '';
        const rootUrl = pathParts.join('/') + '/';
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", rootUrl, fileName, scene);
        if (result.meshes.length > 0) {
          result.meshes.forEach((m: any) => {
            const name = m.name.toLowerCase();
            if (name.includes("environment") || name.includes("__root__ground") || name === "ground") {
              m.dispose();
            }
          });

          // Load and attach additional models (for composite character preview)
          const rootMesh = result.meshes.find((m: any) => !m.isDisposed());
          if (rootMesh && additionalModelPaths && additionalModelPaths.length > 0) {
            for (const addPath of additionalModelPaths) {
              try {
                const addFull = addPath.startsWith('/') ? addPath : `/${addPath}`;
                const addParts = addFull.split('/');
                const addFile = addParts.pop() || '';
                const addRoot = addParts.join('/') + '/';
                const addResult = await BABYLON.SceneLoader.ImportMeshAsync("", addRoot, addFile, scene);
                if (addResult.meshes.length > 0) {
                  const addMesh = addResult.meshes[0];
                  addMesh.parent = rootMesh;
                  addMesh.position = BABYLON.Vector3.Zero();
                }
              } catch (addErr) {
                console.warn("ConfigPreviewScene: Failed to load additional model", addPath, addErr);
              }
            }
          }

          const remaining = scene.meshes.filter((m: any) => m.name !== "ground" && !m.isDisposed());
          frameMeshes(camera, remaining, BABYLON);
        }
      } catch (err) {
        console.warn("ConfigPreviewScene: Failed to load model", modelPath, err);
      }
    }

    engine.runRenderLoop(() => scene.render());

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      babylonRef.current = null;
      cameraRef.current = null;
    };
  // Structural props only — buildProcedural excluded to avoid flicker
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath, JSON.stringify(additionalModelPaths), groundColor, showGround, autoRotate]);

  // Initial setup
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    setup().then(fn => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [setup]);

  // Rebuild procedural meshes when buildProcedural changes (without recreating engine)
  useEffect(() => {
    const scene = sceneRef.current;
    const BABYLON = babylonRef.current;
    const camera = cameraRef.current;
    if (!scene || !BABYLON || !camera || !buildProcedural) return;

    // Remove all non-infrastructure meshes and their materials
    const toRemove = scene.meshes.filter((m: any) => !INFRASTRUCTURE_NAMES.has(m.name));
    for (const mesh of toRemove) {
      if (mesh.material && !mesh.material.name.startsWith("ground")) {
        mesh.material.dispose();
      }
      mesh.dispose();
    }

    // Build new procedural meshes
    buildProcedural(scene, BABYLON);

    // Re-frame camera
    const meshes = scene.meshes.filter((m: any) => !INFRASTRUCTURE_NAMES.has(m.name));
    if (meshes.length > 0) {
      frameMeshes(camera, meshes, BABYLON);
    }
  }, [buildProcedural]);

  const toggleRotation = useCallback(() => {
    const next = !isRotatingRef.current;
    isRotatingRef.current = next;
    setIsRotating(next);
  }, []);

  const zoomIn = useCallback(() => {
    const cam = cameraRef.current;
    if (cam) cam.radius = Math.max(cam.lowerRadiusLimit ?? 1, cam.radius * 0.8);
  }, []);

  const zoomOut = useCallback(() => {
    const cam = cameraRef.current;
    if (cam) cam.radius = Math.min(cam.upperRadiusLimit ?? 20, cam.radius * 1.25);
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

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      requestAnimationFrame(() => engineRef.current?.resize());
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative rounded-lg border overflow-hidden bg-muted/30 ${className}`} style={{ height: isFullscreen ? '100%' : height }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ outline: "none" }} />
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <button onClick={toggleFullscreen} className="p-1 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
        <button onClick={zoomIn} className="p-1 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={zoomOut} className="p-1 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={toggleRotation} className="p-1 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors" title={isRotating ? 'Stop rotation' : 'Resume rotation'}>
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function frameMeshes(camera: any, meshes: any[], BABYLON: any) {
  if (meshes.length === 0) return;
  let min = new BABYLON.Vector3(Infinity, Infinity, Infinity);
  let max = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
  for (const m of meshes) {
    m.computeWorldMatrix(true);
    const bounds = m.getBoundingInfo();
    if (!bounds) continue;
    min = BABYLON.Vector3.Minimize(min, bounds.boundingBox.minimumWorld);
    max = BABYLON.Vector3.Maximize(max, bounds.boundingBox.maximumWorld);
  }
  const center = BABYLON.Vector3.Center(min, max);
  const size = max.subtract(min);
  const maxDim = Math.max(size.x, size.y, size.z, 0.1);
  camera.target = center;
  camera.radius = maxDim * 2;
}
