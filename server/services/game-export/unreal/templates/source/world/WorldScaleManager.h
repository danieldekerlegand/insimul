#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "WorldScaleManager.generated.h"

UCLASS()
class INSIMULEXPORT_API UWorldScaleManager : public UWorldSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    UPROPERTY(BlueprintReadOnly, Category = "World")
    int32 TerrainSize = {{TERRAIN_SIZE}};

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FLinearColor GroundColor = FLinearColor({{GROUND_COLOR_R}}, {{GROUND_COLOR_G}}, {{GROUND_COLOR_B}});

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FLinearColor SkyColor = FLinearColor({{SKY_COLOR_R}}, {{SKY_COLOR_G}}, {{SKY_COLOR_B}});

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FLinearColor RoadColor = FLinearColor({{ROAD_COLOR_R}}, {{ROAD_COLOR_G}}, {{ROAD_COLOR_B}});

    UFUNCTION(BlueprintCallable, Category = "World")
    float GetSettlementRadius(int32 Population);
};
