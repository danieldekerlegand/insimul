import { useMemo } from 'react';
import { Text, Box, Cylinder } from '@react-three/drei';
import { Character3D } from './Character3D';
import { Building3D } from './Building3D';

interface Settlement3DProps {
  settlement: any;
  position: { x: number; y: number; z: number };
  worldData: any;
  onCharacterInteraction: (character: any) => void;
}

export function Settlement3D({
  settlement,
  position,
  worldData,
  onCharacterInteraction
}: Settlement3DProps) {
  // Get all entities in this settlement
  const settlementData = useMemo(() => {
    const lots = worldData.lots?.filter((l: any) => l.settlementId === settlement.id) || [];
    const businesses = worldData.businesses?.filter((b: any) => b.settlementId === settlement.id) || [];
    const residences = worldData.residences?.filter((r: any) => r.settlementId === settlement.id) || [];
    const characters = worldData.characters?.filter((c: any) => {
      // Check if character is in this settlement
      const charResidence = residences.find((r: any) => r.residentIds?.includes(c.id));
      const charBusiness = businesses.find((b: any) => b.ownerId === c.id);
      return charResidence || charBusiness;
    }) || [];

    return { lots, businesses, residences, characters };
  }, [settlement, worldData]);

  // Generate building layout
  const buildings = useMemo(() => {
    const result: any[] = [];
    const { lots, businesses, residences } = settlementData;

    // Create buildings from lots
    lots.forEach((lot: any, index: number) => {
      // Arrange buildings in a grid
      const gridSize = Math.ceil(Math.sqrt(lots.length));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const localX = (col - gridSize / 2) * 8;
      const localZ = (row - gridSize / 2) * 8;

      const building = businesses.find((b: any) => b.lotId === lot.id) ||
                      residences.find((r: any) => r.lotId === lot.id);

      result.push({
        lot,
        building,
        position: { x: localX, y: 0, z: localZ },
        type: lot.buildingType
      });
    });

    // If no lots, create some default buildings based on settlement type
    if (result.length === 0) {
      const defaultBuildingCount = settlement.settlementType === 'city' ? 20 :
                                   settlement.settlementType === 'town' ? 10 : 5;

      for (let i = 0; i < defaultBuildingCount; i++) {
        const gridSize = Math.ceil(Math.sqrt(defaultBuildingCount));
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        result.push({
          lot: null,
          building: businesses[i] || residences[i],
          position: {
            x: (col - gridSize / 2) * 8,
            y: 0,
            z: (row - gridSize / 2) * 8
          },
          type: i < businesses.length ? 'business' : 'residence'
        });
      }
    }

    return result;
  }, [settlement, settlementData]);

  // Position characters in the settlement
  const positionedCharacters = useMemo(() => {
    return settlementData.characters.map((character: any, index: number) => {
      // Try to position character at their residence or workplace
      let charPosition = { x: 0, z: 0 };

      const residence = settlementData.residences.find((r: any) =>
        r.residentIds?.includes(character.id)
      );

      if (residence) {
        const lot = settlementData.lots.find((l: any) => l.id === residence.lotId);
        if (lot) {
          const lotIndex = settlementData.lots.indexOf(lot);
          const gridSize = Math.ceil(Math.sqrt(settlementData.lots.length));
          const row = Math.floor(lotIndex / gridSize);
          const col = lotIndex % gridSize;
          charPosition = {
            x: (col - gridSize / 2) * 8 + (Math.random() - 0.5) * 3,
            z: (row - gridSize / 2) * 8 + (Math.random() - 0.5) * 3
          };
        }
      } else {
        // Random position in settlement
        const angle = (index / settlementData.characters.length) * Math.PI * 2;
        const radius = 15;
        charPosition = {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius
        };
      }

      return {
        character,
        position: charPosition
      };
    });
  }, [settlementData]);

  // Determine settlement color based on type
  const settlementColor = settlement.settlementType === 'city' ? '#ffd700' :
                         settlement.settlementType === 'town' ? '#ffeb3b' : '#fff59d';

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Settlement name marker */}
      <group position={[0, 15, 0]}>
        <Text
          fontSize={2}
          color={settlementColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="black"
        >
          {settlement.name}
        </Text>
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {settlement.settlementType.toUpperCase()}
        </Text>
      </group>

      {/* Central plaza/landmark */}
      <Cylinder
        args={[10, 10, 0.5, 32]}
        position={[0, 0.25, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#cccccc" />
      </Cylinder>

      {/* Central monument/fountain */}
      <Cylinder
        args={[1, 1.5, 3, 16]}
        position={[0, 1.5, 0]}
        castShadow
      >
        <meshStandardMaterial color="#8b7355" />
      </Cylinder>

      {/* Buildings */}
      {buildings.map((item, index) => (
        <Building3D
          key={`building-${index}`}
          building={item.building}
          lot={item.lot}
          position={item.position}
          type={item.type}
        />
      ))}

      {/* Characters */}
      {positionedCharacters.map(({ character, position: charPos }, index: number) => (
        <Character3D
          key={character.id}
          character={character}
          position={{ x: charPos.x, y: 0, z: charPos.z }}
          onInteraction={onCharacterInteraction}
        />
      ))}

      {/* Settlement boundary indicator */}
      <Cylinder
        args={[40, 40, 0.2, 32]}
        position={[0, 0.1, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color={settlementColor}
          transparent
          opacity={0.1}
        />
      </Cylinder>
    </group>
  );
}
