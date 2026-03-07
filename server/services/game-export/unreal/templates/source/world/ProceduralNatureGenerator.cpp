#include "ProceduralNatureGenerator.h"

AProceduralNatureGenerator::AProceduralNatureGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AProceduralNatureGenerator::GenerateNature(int32 TerrainSize, const FString& Seed)
{
    // TODO: Scatter foliage using UInstancedStaticMeshComponent
    // Use seeded random with the world seed for deterministic placement
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate nature for terrain %d (seed: %s)"),
        TerrainSize, *Seed);
}
