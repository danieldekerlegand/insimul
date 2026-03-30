import { useRef, useEffect, useCallback, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ActionAnimationEntry } from "@shared/game-engine/action-animation-map";

/**
 * ActionAnimationPreview
 *
 * Renders a Quaternius character model playing the animation clip mapped to
 * a base action. Loads the animation pack GLB, finds the matching animation
 * group, and plays it in a small Babylon.js viewport.
 */

const ANIM_PACK_PATH = "./assets/models/characters/quaternius/anim_ual1_standard/anim_ual1_standard.glb";

interface ActionAnimationPreviewProps {
  entry: ActionAnimationEntry;
  height?: number;
}

export function ActionAnimationPreview({ entry, height = 180 }: ActionAnimationPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const currentAnimRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupScene = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const BABYLON = await import("@babylonjs/core");
      await import("@babylonjs/loaders/glTF");

      // Create engine and scene
      const engine = new BABYLON.Engine(canvasRef.current, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true,
      });
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.08, 0.08, 0.12, 1);

      engineRef.current = engine;
      sceneRef.current = scene;

      // Camera
      const camera = new BABYLON.ArcRotateCamera(
        "animCam",
        Math.PI / 4,
        Math.PI / 2.5,
        4,
        new BABYLON.Vector3(0, 1, 0),
        scene,
      );
      camera.attachControl(canvasRef.current, true);
      camera.minZ = 0.1;
      camera.wheelDeltaPercentage = 0.02;
      camera.lowerRadiusLimit = 2;
      camera.upperRadiusLimit = 8;

      // Lights
      const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
      hemi.intensity = 0.8;
      const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-0.5, -1, 0.5), scene);
      dir.intensity = 0.6;

      // Ground
      const ground = BABYLON.MeshBuilder.CreateDisc("ground", { radius: 2 }, scene);
      ground.rotation.x = Math.PI / 2;
      const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
      groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
      groundMat.specularColor = BABYLON.Color3.Black();
      ground.material = groundMat;

      // Load animation pack
      const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", ANIM_PACK_PATH, scene);

      // Stop all animations initially
      for (const group of scene.animationGroups) {
        group.stop();
      }

      // Find and play the target animation
      const targetClip = entry.animationClip;
      const fallbackClip = entry.animationFallback;

      let animGroup = scene.animationGroups.find(
        (g: any) => g.name === targetClip || g.name.endsWith(`_${targetClip}`),
      );
      if (!animGroup) {
        animGroup = scene.animationGroups.find(
          (g: any) => g.name === fallbackClip || g.name.endsWith(`_${fallbackClip}`),
        );
      }

      if (animGroup) {
        animGroup.start(entry.loop, 1.0);
        currentAnimRef.current = animGroup;
      }

      // Position model at origin
      if (result.meshes[0]) {
        result.meshes[0].position = BABYLON.Vector3.Zero();
      }

      setLoaded(true);

      // Render loop
      engine.runRenderLoop(() => {
        scene.render();
      });

      // Resize handling
      const onResize = () => engine.resize();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        engine.dispose();
      };
    } catch (err: any) {
      setError(err.message || "Failed to load animation");
    }
  }, [entry.animationClip, entry.animationFallback, entry.loop]);

  useEffect(() => {
    const cleanup = setupScene();
    return () => {
      cleanup?.then((fn) => fn?.());
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [setupScene]);

  const handlePlayPause = () => {
    const anim = currentAnimRef.current;
    if (!anim) return;
    if (isPlaying) {
      anim.pause();
    } else {
      anim.play(entry.loop);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    const anim = currentAnimRef.current;
    if (!anim) return;
    anim.stop();
    anim.start(entry.loop, 1.0);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[9px] capitalize">{entry.category}</Badge>
          {entry.loop && <Badge variant="outline" className="text-[9px]">Loop</Badge>}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePlayPause}
            className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={handleRestart}
            className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div
        className="relative rounded overflow-hidden border border-border"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <span className="text-xs text-muted-foreground">Loading model...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <span className="text-xs text-red-400">{error}</span>
          </div>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground space-y-0.5">
        <div className="flex items-center gap-1">
          <Play className="w-2.5 h-2.5 text-green-500" />
          <span className="font-mono">{entry.animationClip}</span>
        </div>
        {entry.animationFallback !== entry.animationClip && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground/60">fallback:</span>
            <span className="font-mono">{entry.animationFallback}</span>
          </div>
        )}
      </div>
    </div>
  );
}
