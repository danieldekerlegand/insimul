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
