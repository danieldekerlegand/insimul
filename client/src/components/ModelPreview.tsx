/**
 * ModelPreview - A lightweight 3D model viewer component
 * Uses Babylon.js to render .glb/.gltf models inline
 */

import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelPreviewProps {
  modelPath: string;
  className?: string;
  showControls?: boolean;
}

export function ModelPreview({ modelPath, className = '', showControls = true }: ModelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !modelPath) return;

    // Create engine
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    // Create scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
    sceneRef.current = scene;

    // Create camera
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 3,
      5,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;
    camera.wheelPrecision = 50;
    cameraRef.current = camera;

    // Add lights
    const hemisphericLight = new BABYLON.HemisphericLight(
      'hemisphericLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemisphericLight.intensity = 0.7;

    const directionalLight = new BABYLON.DirectionalLight(
      'directionalLight',
      new BABYLON.Vector3(-1, -2, -1),
      scene
    );
    directionalLight.intensity = 0.5;

    // Load model
    const fullPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop() || '';
    const rootUrl = pathParts.join('/') + '/';

    setIsLoading(true);
    setError(null);

    BABYLON.SceneLoader.ImportMesh(
      '',
      rootUrl,
      fileName,
      scene,
      (meshes) => {
        if (meshes.length > 0) {
          // Calculate bounding box and center model
          let min = new BABYLON.Vector3(Infinity, Infinity, Infinity);
          let max = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);

          meshes.forEach((mesh) => {
            if (mesh.getBoundingInfo) {
              const boundingInfo = mesh.getBoundingInfo();
              min = BABYLON.Vector3.Minimize(min, boundingInfo.boundingBox.minimumWorld);
              max = BABYLON.Vector3.Maximize(max, boundingInfo.boundingBox.maximumWorld);
            }
          });

          const center = BABYLON.Vector3.Center(min, max);
          const size = max.subtract(min);
          const maxDimension = Math.max(size.x, size.y, size.z);

          // Center the model
          meshes.forEach((mesh) => {
            if (mesh.parent === null) {
              mesh.position.subtractInPlace(center);
            }
          });

          // Adjust camera
          camera.target = BABYLON.Vector3.Zero();
          camera.radius = maxDimension * 2;
        }
        setIsLoading(false);
      },
      undefined,
      (_scene, message) => {
        console.error('Failed to load model:', message);
        setError('Failed to load model');
        setIsLoading(false);
      }
    );

    // Auto-rotate
    let rotationObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>> = null;
    if (autoRotate) {
      rotationObserver = scene.onBeforeRenderObservable.add(() => {
        camera.alpha += 0.005;
      });
    }

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rotationObserver) {
        scene.onBeforeRenderObservable.remove(rotationObserver);
      }
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [modelPath]);

  // Update auto-rotate state
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    // Remove existing observer
    scene.onBeforeRenderObservable.clear();

    if (autoRotate) {
      scene.onBeforeRenderObservable.add(() => {
        camera.alpha += 0.005;
      });
    }
  }, [autoRotate]);

  const handleZoomIn = () => {
    const camera = cameraRef.current;
    if (camera) {
      camera.radius = Math.max(camera.lowerRadiusLimit || 1, camera.radius - 1);
    }
  };

  const handleZoomOut = () => {
    const camera = cameraRef.current;
    if (camera) {
      camera.radius = Math.min(camera.upperRadiusLimit || 20, camera.radius + 1);
    }
  };

  const handleResetView = () => {
    const camera = cameraRef.current;
    if (camera) {
      camera.alpha = Math.PI / 4;
      camera.beta = Math.PI / 3;
      camera.radius = 5;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ touchAction: 'none' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {showControls && !isLoading && !error && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-black/50 hover:bg-black/70"
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
          >
            <RotateCcw className={`h-4 w-4 ${autoRotate ? 'text-blue-400' : 'text-white'}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-black/50 hover:bg-black/70"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4 text-white" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-black/50 hover:bg-black/70"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}
