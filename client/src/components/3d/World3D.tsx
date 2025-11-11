import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Sky,
  Environment,
  OrbitControls,
  Text,
  Box,
  Sphere,
  Cylinder,
  Plane
} from '@react-three/drei';
import * as THREE from 'three';
import { Terrain } from './Terrain';
import { Settlement3D } from './Settlement3D';
import { Character3D } from './Character3D';

interface World3DProps {
  worldData: any;
  playerPosition: { x: number; y: number; z: number };
  onPlayerMove: (position: { x: number; y: number; z: number }) => void;
  onCharacterInteraction: (character: any) => void;
  currentLocation: any;
}

export function World3D({
  worldData,
  playerPosition,
  onPlayerMove,
  onCharacterInteraction,
  currentLocation
}: World3DProps) {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const [moveDirection, setMoveDirection] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<Set<string>>(new Set());

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.add(key);

      // Open map with M key
      if (key === 'm') {
        // This would trigger the fast travel map
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update player movement based on keys
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const moveSpeed = 10 * delta;
    let moveX = 0;
    let moveZ = 0;

    // Calculate movement direction
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      moveZ -= moveSpeed;
    }
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
      moveZ += moveSpeed;
    }
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      moveX -= moveSpeed;
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
      moveX += moveSpeed;
    }

    // Apply movement
    if (moveX !== 0 || moveZ !== 0) {
      // Calculate camera-relative movement
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

      const movement = new THREE.Vector3();
      movement.addScaledVector(cameraDirection, -moveZ);
      movement.addScaledVector(cameraRight, moveX);

      playerRef.current.position.add(movement);

      // Update player position
      const newPos = {
        x: playerRef.current.position.x,
        y: playerRef.current.position.y,
        z: playerRef.current.position.z
      };
      onPlayerMove(newPos);

      // Update camera to follow player (third-person view)
      const idealOffset = new THREE.Vector3(0, 5, 10);
      const idealPosition = playerRef.current.position.clone().add(idealOffset);
      camera.position.lerp(idealPosition, 0.1);
      camera.lookAt(playerRef.current.position);
    }
  });

  // Generate world layout based on settlements
  const generateWorldLayout = () => {
    const settlements = worldData.settlements || [];
    const spacing = 100; // Distance between settlements

    return settlements.map((settlement: any, index: number) => {
      // Arrange settlements in a grid pattern
      const gridSize = Math.ceil(Math.sqrt(settlements.length));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const x = (col - gridSize / 2) * spacing;
      const z = (row - gridSize / 2) * spacing;

      return {
        settlement,
        position: { x, y: 0, z }
      };
    });
  };

  const settlementPositions = generateWorldLayout();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0}
        azimuth={0.25}
      />

      {/* Ground Plane */}
      <Plane
        args={[10000, 10000]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#4a7c0f" />
      </Plane>

      {/* Terrain - procedurally generated based on world data */}
      <Terrain worldData={worldData} />

      {/* Render settlements */}
      {settlementPositions.map(({ settlement, position }, index: number) => (
        <Settlement3D
          key={settlement.id}
          settlement={settlement}
          position={position}
          worldData={worldData}
          onCharacterInteraction={onCharacterInteraction}
        />
      ))}

      {/* Player character */}
      <group ref={playerRef} position={[playerPosition.x, 1, playerPosition.z]}>
        {/* Player body */}
        <Cylinder args={[0.5, 0.5, 1.5, 8]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial color="#3b82f6" />
        </Cylinder>

        {/* Player head */}
        <Sphere args={[0.4, 16, 16]} position={[0, 1.9, 0]} castShadow>
          <meshStandardMaterial color="#ffd7a8" />
        </Sphere>

        {/* Player name label */}
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          You
        </Text>
      </group>

      {/* Camera controls (orbit controls for looking around) */}
      <OrbitControls
        target={playerRef.current?.position || [0, 0, 0]}
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}
