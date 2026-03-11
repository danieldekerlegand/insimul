#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "QuestSystem.generated.h"

/**
 * Quest objective data mirroring Insimul's QuestObjective interface.
 */
USTRUCT(BlueprintType)
struct FQuestObjective
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadWrite) FString Id;
    UPROPERTY(BlueprintReadWrite) FString QuestId;
    UPROPERTY(BlueprintReadWrite) FString Type;
    UPROPERTY(BlueprintReadWrite) FString Description;
    UPROPERTY(BlueprintReadWrite) bool bCompleted = false;
    UPROPERTY(BlueprintReadWrite) int32 RequiredCount = 1;
    UPROPERTY(BlueprintReadWrite) int32 CurrentCount = 0;

    /** Time limit in seconds (0 = untimed) */
    UPROPERTY(BlueprintReadWrite) float TimeLimitSeconds = 0.f;

    /** Timestamp (game-time seconds) when objective was started */
    UPROPERTY(BlueprintReadWrite) float StartedAt = -1.f;

    /** Number of English hints requested (for navigation/directions) */
    UPROPERTY(BlueprintReadWrite) int32 HintsRequested = 0;

    /** Whether a GPS-style waypoint is currently shown */
    UPROPERTY(BlueprintReadWrite) bool bShowWaypoint = false;

    /** Vocabulary category for scavenger hunt rotation */
    UPROPERTY(BlueprintReadWrite) FString VocabularyCategory;
};

/**
 * Scavenger hunt category list for vocabulary rotation.
 */
static const TArray<FString> SCAVENGER_CATEGORIES = {
    TEXT("food"), TEXT("colors"), TEXT("animals"), TEXT("clothing"), TEXT("household"),
    TEXT("nature"), TEXT("body"), TEXT("professions"), TEXT("transportation"), TEXT("weather")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStoryTTS, const FString&, StoryText, const FString&, NpcId);

/**
 * Tracks quests, objectives, and completion.
 * Ported from Insimul's Babylon.js QuestObjectManager.
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

    /** Check timed objectives and return descriptions of any that expired. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    TArray<FString> CheckTimedObjectives();

    /** Get remaining seconds for a timed objective, or -1 if untimed. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Quests")
    float GetObjectiveTimeRemaining(const FString& ObjectiveId) const;

    /** Request a GPS-style waypoint hint. Returns English hint text or empty. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    FString RequestNavigationHint(const FString& QuestId);

    /** Get next scavenger hunt category (round-robin). */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Quests")
    static FString GetNextScavengerCategory(int32 LastCategoryIndex);

    /** Fired when a listening_comprehension objective starts and story should be spoken. */
    UPROPERTY(BlueprintAssignable, Category = "Quests")
    FOnStoryTTS OnStoryTTS;

private:
    TArray<FQuestObjective> Objectives;
    float GameTime = 0.f;
};
