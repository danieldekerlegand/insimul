#include "ProceduralBuildingGenerator.h"

AProceduralBuildingGenerator::AProceduralBuildingGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AProceduralBuildingGenerator::GenerateBuilding(FVector Position, float Rotation,
    int32 Floors, float Width, float Depth, const FString& BuildingRole)
{
    // TODO: Generate procedural building mesh using ProceduralMeshComponent
    // For now, spawn a cube placeholder scaled to building dimensions
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate building %s at %s (%dx%.0fx%.0f)"),
        *BuildingRole, *Position.ToString(), Floors, Width, Depth);
}
