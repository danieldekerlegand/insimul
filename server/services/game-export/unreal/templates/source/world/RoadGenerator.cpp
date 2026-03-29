#include "RoadGenerator.h"

ARoadGenerator::ARoadGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void ARoadGenerator::GenerateRoad(const TArray<FVector>& Waypoints, float Width)
{
    // TODO: Generate road spline mesh between waypoints
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate road with %d waypoints, width %.1f"),
        Waypoints.Num(), Width);
}

void ARoadGenerator::CreateStreetSign(FVector Position, const FString& StreetName, FVector StreetDirection)
{
    // TODO: Create street sign mesh oriented parallel to street direction (double-sided)
    // Sign should use StreetDirection to compute rotation: FMath::Atan2(StreetDirection.X, StreetDirection.Y)
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Create street sign '%s' at (%.1f, %.1f, %.1f)"),
        *StreetName, Position.X, Position.Y, Position.Z);
}
