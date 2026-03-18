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

    /** Target words for vocabulary objectives (empty = any word counts) */
    UPROPERTY(BlueprintReadWrite) TArray<FString> TargetWords;

    /** Words already used (for deduplication) */
    UPROPERTY(BlueprintReadWrite) TArray<FString> WordsUsed;
};

/**
 * Scavenger hunt category list for vocabulary rotation.
 */
static const TArray<FString> SCAVENGER_CATEGORIES = {
    TEXT("food"), TEXT("colors"), TEXT("animals"), TEXT("clothing"), TEXT("household"),
    TEXT("nature"), TEXT("body"), TEXT("professions"), TEXT("transportation"), TEXT("weather")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStoryTTS, const FString&, StoryText, const FString&, NpcId);

/** Delegate to test whether a world-space XZ point falls inside a building footprint. */
DECLARE_DELEGATE_RetVal_TwoParams(bool, FPointInBuildingCheck, float /*X*/, float /*Z*/);

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

    /** Track vocabulary usage for use_vocabulary / collect_vocabulary objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackVocabularyUsage(const FString& Word, const FString& QuestId = TEXT(""));

    /** Track a conversation turn for complete_conversation objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackConversationTurn(const TArray<FString>& Keywords, const FString& QuestId = TEXT(""));

    /** Track a pronunciation attempt for pronunciation_check objectives. Score is 0-100. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackPronunciationAttempt(bool bPassed, float Score = 0.f, const FString& QuestId = TEXT(""));

    /** Check if player is near a direction/navigation waypoint. Call from Tick(). */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void CheckDirectionProximity(const FVector& PlayerPos);

    /** Register a building-check callback so spawned items avoid building interiors. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void SetPointInBuildingCheck(const FPointInBuildingCheck& Check);

    /** Generate spread-out item positions that avoid building interiors. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    TArray<FVector> GenerateItemPositions(int32 Count) const;

    /** Generate a single location position that avoids building interiors. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Quests")
    FVector GenerateLocationPosition() const;

    /** Get world positions of uncollected quest items for minimap markers. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Quests")
    TArray<FVector> GetCollectibleItemPositions() const;

    /** Attach debug metadata to a quest marker actor (used for hover tooltips). */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    static void SetMarkerDebugLabel(AActor* Marker, const FString& Label);

    /** Fired when a listening_comprehension objective starts and story should be spoken. */
    UPROPERTY(BlueprintAssignable, Category = "Quests")
    FOnStoryTTS OnStoryTTS;

private:
    TArray<FQuestObjective> Objectives;
    float GameTime = 0.f;

    /** Optional callback to test whether a world XZ point is inside a building footprint. */
    FPointInBuildingCheck PointInBuildingCheck;
};
