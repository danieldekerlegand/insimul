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

    static constexpr float SPAWN_CLEAR_RADIUS = 15.f;

    UFUNCTION(BlueprintCallable, Category = "World")
    float GetSettlementRadius(int32 Population);

    UFUNCTION(BlueprintCallable, Category = "World")
    static FString GetSettlementTier(int32 Population);

    UFUNCTION(BlueprintCallable, Category = "World")
    static TArray<FVector> GenerateLotPositions(FVector SettlementPosition, float SettlementRadius, int32 LotCount, const TArray<FString>& StreetNames = TArray<FString>());

    /** Distribute settlements within territory bounds, using 25% margin and center-placement for single settlements. */
    UFUNCTION(BlueprintCallable, Category = "World")
    static TArray<FVector> DistributeSettlements(FVector BoundsMin, FVector BoundsMax, FVector BoundsCenter, int32 SettlementCount, const TArray<float>& Radii, int32 WorldSeed);

    /** Generate a full street-aligned layout for a settlement. Returns lot positions, facing angles, and street metadata. */
    UFUNCTION(BlueprintCallable, Category = "World")
    static void GenerateStreetAlignedSettlement(FVector SettlementPosition, float SettlementRadius, int32 LotCount, int32 BizCount = 0, const TArray<FString>& StreetNames = TArray<FString>(), const TArray<FVector>& ExistingStreetPoints = TArray<FVector>());

    UFUNCTION(BlueprintCallable, Category = "World")
    static int32 CalculateOptimalWorldSize(int32 CountryCount, int32 StateCount, int32 SettlementCount);
};
