#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ProceduralNatureGenerator.generated.h"

UCLASS()
class INSIMULEXPORT_API AProceduralNatureGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralNatureGenerator();

    UFUNCTION(BlueprintCallable, Category = "Nature")
    void GenerateNature(int32 TerrainSize, const FString& Seed);
};
