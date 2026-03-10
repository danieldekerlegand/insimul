#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "NPCData.generated.h"

USTRUCT(BlueprintType)
struct INSIMULEXPORT_API FInsimulNPCData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NPCRole;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector HomePosition = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float PatrolRadius = 20.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Disposition = 50.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> QuestIds;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Greeting;
};
