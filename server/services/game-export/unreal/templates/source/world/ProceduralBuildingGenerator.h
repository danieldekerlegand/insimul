#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ProceduralBuildingGenerator.generated.h"

UCLASS()
class INSIMULEXPORT_API AProceduralBuildingGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralBuildingGenerator();

    UFUNCTION(BlueprintCallable, Category = "Building")
    void GenerateBuilding(FVector Position, float Rotation, int32 Floors,
                          float Width, float Depth, const FString& BuildingRole);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor BaseColor = FLinearColor({{BASE_COLOR_R}}, {{BASE_COLOR_G}}, {{BASE_COLOR_B}});

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor RoofColor = FLinearColor({{ROOF_COLOR_R}}, {{ROOF_COLOR_G}}, {{ROOF_COLOR_B}});
};
