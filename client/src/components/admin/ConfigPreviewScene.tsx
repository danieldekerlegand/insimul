import { useRef, useEffect, useCallback } from "react";

/**
 * Lightweight Babylon.js preview scene for config panels.
 * Renders a small 3D viewport with a ground plane and optional model.
 * Used by Building, Ground, Character, Nature, and Item config panels.
 */

interface ConfigPreviewSceneProps {
  /** Asset file path (relative) to load as a 3D model */
  modelPath?: string;
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
  /** Procedural builder callback — build meshes instead of loading a model */
  buildProcedural?: (scene: any) => void;
}

export function ConfigPreviewScene({
  modelPath,
  groundColor = "#4a5568",
  showGround = true,
  autoRotate = true,
  height = 200,
  className = "",
  onSceneReady,
  buildProcedural,
}: ConfigPreviewSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  const setup = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dynamic import to avoid SSR issues
    const BABYLON = await import("@babylonjs/core");
    await import("@babylonjs/loaders/glTF");

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
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;
    camera.wheelPrecision = 50;

    if (autoRotate) {
      camera.useAutoRotationBehavior = true;
      if (camera.autoRotationBehavior) {
        camera.autoRotationBehavior.idleRotationSpeed = 0.3;
      }
    }

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

    // Procedural mesh builder
    if (buildProcedural) {
      buildProcedural(scene);
      // Frame all meshes
      const meshes = scene.meshes.filter((m: any) => m.name !== "ground");
      if (meshes.length > 0) {
        frameMeshes(camera, meshes, BABYLON);
      }
    }

    // Load model if provided
    if (modelPath && !buildProcedural) {
      try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/", modelPath, scene);
        if (result.meshes.length > 0) {
          // Remove environment/ground meshes from loaded model
          result.meshes.forEach((m: any) => {
            const name = m.name.toLowerCase();
            if (name.includes("environment") || name.includes("__root__ground") || name === "ground") {
              m.dispose();
            }
          });
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
    };
  }, [modelPath, groundColor, showGround, autoRotate, buildProcedural]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    setup().then(fn => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [setup]);

  return (
    <div className={`relative rounded-lg border overflow-hidden bg-muted/30 ${className}`} style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ outline: "none" }} />
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
