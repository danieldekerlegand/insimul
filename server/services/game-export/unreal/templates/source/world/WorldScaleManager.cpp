#include "WorldScaleManager.h"

void UWorldScaleManager::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] WorldScaleManager initialized (terrain: %d)"), TerrainSize);
}

float UWorldScaleManager::GetSettlementRadius(int32 Population)
{
    struct FPopTier { int32 Min; int32 Max; float Radius; };
    static const FPopTier Tiers[] = {
        {0, 50, 20.f}, {51, 200, 35.f}, {201, 1000, 55.f},
        {1001, 5000, 80.f}, {5001, INT32_MAX, 120.f}
    };

    for (const auto& T : Tiers)
    {
        if (Population <= T.Max) return T.Radius;
    }
    return 20.f;
}

FString UWorldScaleManager::GetSettlementTier(int32 Population)
{
    if (Population < 100) return TEXT("hamlet");
    if (Population < 500) return TEXT("village");
    if (Population < 2000) return TEXT("town");
    if (Population < 10000) return TEXT("city");
    return TEXT("metropolis");
}

TArray<FVector> UWorldScaleManager::GenerateLotPositions(FVector SettlementPosition, float SettlementRadius, int32 LotCount, const TArray<FString>& StreetNames)
{
    TArray<FVector> Positions;
    if (LotCount <= 0) return Positions;

    const int32 Cols = FMath::CeilToInt(FMath::Sqrt(static_cast<float>(LotCount)));
    const int32 Rows = FMath::CeilToInt(static_cast<float>(LotCount) / Cols);
    const float LotSpacing = 20.f;
    const float GridWidth = (Cols - 1) * LotSpacing;
    const float GridHeight = (Rows - 1) * LotSpacing;

    FRandomStream Rand(GetTypeHash(FString::Printf(TEXT("%f_%f"), SettlementPosition.X, SettlementPosition.Z)));

    for (int32 i = 0; i < LotCount; i++)
    {
        const int32 Row = i / Cols;
        const int32 Col = i % Cols;

        float BaseX = SettlementPosition.X - GridWidth / 2.f + Col * LotSpacing;
        float BaseZ = SettlementPosition.Y - GridHeight / 2.f + Row * LotSpacing;

        float JitterX = (Rand.FRand() - 0.5f) * 4.f;
        float JitterZ = (Rand.FRand() - 0.5f) * 4.f;

        float LotX = BaseX + JitterX;
        float LotZ = BaseZ + JitterZ;

        // Push lots outside spawn clear radius
        float DX = LotX - SettlementPosition.X;
        float DZ = LotZ - SettlementPosition.Y;
        float Dist = FMath::Sqrt(DX * DX + DZ * DZ);
        if (Dist < SPAWN_CLEAR_RADIUS)
        {
            float Angle = Dist > 0.001f ? FMath::Atan2(DZ, DX) : (i * PI * 0.618f);
            LotX = SettlementPosition.X + FMath::Cos(Angle) * SPAWN_CLEAR_RADIUS;
            LotZ = SettlementPosition.Y + FMath::Sin(Angle) * SPAWN_CLEAR_RADIUS;
        }

        Positions.Add(FVector(LotX, LotZ, 0.f));
    }

    return Positions;
}

void UWorldScaleManager::GenerateStreetAlignedSettlement(FVector SettlementPosition, float SettlementRadius, int32 LotCount, int32 BizCount, const TArray<FString>& StreetNames)
{
    // TODO: Implement street-aligned placement (main street + side streets).
    // For now, falls back to grid+jitter via GenerateLotPositions.
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] GenerateStreetAlignedSettlement not yet implemented in export template"));
}

int32 UWorldScaleManager::CalculateOptimalWorldSize(int32 CountryCount, int32 StateCount, int32 SettlementCount)
{
    const float MaxEntities = FMath::Max3(
        static_cast<float>(CountryCount),
        static_cast<float>(StateCount) / 2.f,
        static_cast<float>(SettlementCount) / 5.f
    );

    if (MaxEntities <= 4.f) return 512;
    if (MaxEntities <= 9.f) return 768;
    if (MaxEntities <= 16.f) return 1024;
    if (MaxEntities <= 25.f) return 1536;
    return 2048;
}
