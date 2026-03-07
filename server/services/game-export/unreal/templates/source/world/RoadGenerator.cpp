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
