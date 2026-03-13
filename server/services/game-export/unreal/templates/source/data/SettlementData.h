#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "SettlementData.generated.h"

USTRUCT(BlueprintType)
struct INSIMULEXPORT_API FInsimulSettlementData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Population = 100;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector Position = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Radius = 20.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CountryId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString StateId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MayorId;

    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MinElevation = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MaxElevation = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MeanElevation = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float ElevationRange = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SlopeClass = TEXT("flat");
};
