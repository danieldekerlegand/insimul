#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "QuestSystem.generated.h"

/**
 * Tracks quests, objectives, and completion
 * Ported from Insimul's Babylon.js QuestSystem to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UQuestSystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|QuestSystem")
    void LoadFromIR(const FString& JsonString);

    UPROPERTY(BlueprintReadOnly, Category = "Quests")
    int32 QuestCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Quests")
    bool AcceptQuest(const FString& QuestId);

    UFUNCTION(BlueprintCallable, Category = "Quests")
    bool CompleteObjective(const FString& QuestId, const FString& ObjectiveId);
};
