#include "ProceduralBuildingGenerator.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInstanceDynamic.h"

AProceduralBuildingGenerator::AProceduralBuildingGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

UMaterialInstanceDynamic* AProceduralBuildingGenerator::GetSharedMaterial(
    const FString& Key, UMaterialInterface* Parent, FLinearColor Color)
{
    if (auto* Existing = MaterialCache.Find(Key))
    {
        return *Existing;
    }
    auto* Mat = UMaterialInstanceDynamic::Create(Parent, this);
    Mat->SetVectorParameterValue(TEXT("BaseColor"), Color);
    MaterialCache.Add(Key, Mat);
    return Mat;
}

void AProceduralBuildingGenerator::GenerateBuilding(FVector Position, float Rotation,
    int32 Floors, float Width, float Depth, const FString& BuildingRole)
{
    // TODO: Generate procedural building mesh using ProceduralMeshComponent
    // For now, spawn a cube placeholder scaled to building dimensions
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate building %s at %s (%dx%.0fx%.0f)"),
        *BuildingRole, *Position.ToString(), Floors, Width, Depth);

    // Performance: mark as static for Unreal's static mesh batching
    SetMobility(EComponentMobility::Static);

    // LOD: cull at configured distance
    if (auto* RootComp = GetRootComponent())
    {
        RootComp->SetCullDistance(LODCullDistance);
    }
}
