#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "QuestData.generated.h"

USTRUCT(BlueprintType)
struct INSIMULEXPORT_API FInsimulQuestObjective : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectiveId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectiveType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsOptional = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 CurrentProgress = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TargetProgress = 1;
};

USTRUCT(BlueprintType)
struct INSIMULEXPORT_API FInsimulQuestData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Title;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Difficulty;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 ExperienceReward = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AssignedByCharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LocationId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LocationName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float LocationX = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float LocationY = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float LocationZ = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Status;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Tags;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> PrerequisiteQuestIds;
};
