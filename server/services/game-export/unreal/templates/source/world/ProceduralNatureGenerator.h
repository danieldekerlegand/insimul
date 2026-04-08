#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "ProceduralNatureGenerator.generated.h"

UCLASS()
class INSIMULEXPORT_API AProceduralNatureGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralNatureGenerator();

    /** Scatter trees and rocks using instanced meshes.
     *  @param TerrainSize  Terrain extent in cm
     *  @param Seed         Random seed for determinism
     *  @param BuildingPositions  Positions to avoid when placing nature
     *  @param RoadSegments       Road start/end pairs to avoid
     *  @param InWorldCenter      Center of the world for placement bounds
     */
    void GenerateNature(int32 TerrainSize, int32 Seed,
                        const TArray<FVector>& BuildingPositions,
                        const TArray<TPair<FVector, FVector>>& RoadSegments,
                        FVector InWorldCenter);

    /** Return all tree ISMC components for external cloning (e.g., grove lots). */
    TArray<UInstancedStaticMeshComponent*> GetTreeTemplates() const;

private:
    UPROPERTY(VisibleAnywhere) UInstancedStaticMeshComponent* TreeTrunkISMC;
    UPROPERTY(VisibleAnywhere) UInstancedStaticMeshComponent* TreeCanopyISMC;
    UPROPERTY(VisibleAnywhere) UInstancedStaticMeshComponent* PineCanopyISMC;
    UPROPERTY(VisibleAnywhere) UInstancedStaticMeshComponent* PalmTrunkISMC;
    UPROPERTY(VisibleAnywhere) UInstancedStaticMeshComponent* RockISMC;
    UPROPERTY(VisibleAnywhere) UInstancedStaticMeshComponent* FlowerISMC;

    bool IsNearBuilding(const FVector& Pos, const TArray<FVector>& Buildings, float MinDist) const;
    bool IsNearRoad(const FVector& Pos, const TArray<TPair<FVector, FVector>>& Roads, float MinDist) const;
    float PointToSegmentDist2D(const FVector& P, const FVector& A, const FVector& B) const;
};
