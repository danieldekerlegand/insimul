#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RoadGenerator.generated.h"

UCLASS()
class INSIMULEXPORT_API ARoadGenerator : public AActor
{
    GENERATED_BODY()

public:
    ARoadGenerator();

    UFUNCTION(BlueprintCallable, Category = "Roads")
    void GenerateRoad(const TArray<FVector>& Waypoints, float Width);

    /** Create a street name sign oriented parallel to the street direction. Double-sided. */
    UFUNCTION(BlueprintCallable, Category = "Roads")
    void CreateStreetSign(FVector Position, const FString& StreetName, FVector StreetDirection);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor RoadColor = FLinearColor({{ROAD_COLOR_R}}, {{ROAD_COLOR_G}}, {{ROAD_COLOR_B}});

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    float RoadRadius = {{ROAD_RADIUS}};
};
