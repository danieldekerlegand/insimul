import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Character3DProps {
  character: any;
  position: { x: number; y: number; z: number };
  onInteraction: (character: any) => void;
}

export function Character3D({ character, position, onInteraction }: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Simple idle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime + position.x) * 0.1;
    }
  });

  // Determine character color based on occupation or gender
  const bodyColor = character.occupation?.toLowerCase().includes('mayor') ? '#9333ea' :
                   character.occupation?.toLowerCase().includes('doctor') ? '#ffffff' :
                   character.occupation?.toLowerCase().includes('merchant') ? '#d97706' :
                   character.gender === 'female' ? '#ec4899' : '#3b82f6';

  const handleClick = (e: any) => {
    e.stopPropagation();
    onInteraction(character);
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Character body */}
      <Cylinder
        args={[0.3, 0.3, 1.2, 8]}
        position={[0, 0.6, 0]}
        castShadow
      >
        <meshStandardMaterial color={bodyColor} emissive={hovered ? bodyColor : '#000000'} emissiveIntensity={hovered ? 0.3 : 0} />
      </Cylinder>

      {/* Character head */}
      <Sphere args={[0.25, 16, 16]} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#ffd7a8" emissive={hovered ? '#ffd7a8' : '#000000'} emissiveIntensity={hovered ? 0.2 : 0} />
      </Sphere>

      {/* Character name label */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {character.firstName}
      </Text>

      {/* Occupation label */}
      {character.occupation && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.15}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          {character.occupation}
        </Text>
      )}

      {/* Interaction indicator when hovered */}
      {hovered && (
        <Cylinder
          args={[0.5, 0.5, 0.1, 16]}
          position={[0, 0.05, 0]}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </Cylinder>
      )}

      {/* Quest indicator */}
      {character.questGiver && (
        <Text
          position={[0, 2.6, 0]}
          fontSize={0.5}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
        >
          !
        </Text>
      )}
    </group>
  );
}
