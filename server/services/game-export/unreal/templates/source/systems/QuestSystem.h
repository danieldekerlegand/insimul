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

    /** Writing prompt for write_response / describe_scene objectives */
    UPROPERTY(BlueprintReadWrite) FString WritingPrompt;

    /** Minimum word count required per submission (0 = no minimum) */
    UPROPERTY(BlueprintReadWrite) int32 MinWordCount = 0;

    /** Whether this objective is conversation-only (no physical actions needed) */
    UPROPERTY(BlueprintReadWrite) bool bConversationOnly = false;

    /** NPC ID for NPC-targeted objectives */
    UPROPERTY(BlueprintReadWrite) FString NpcId;

    /** Words taught to NPC (for teach_vocabulary deduplication) */
    UPROPERTY(BlueprintReadWrite) TArray<FString> WordsTaught;

    /** Phrases taught to NPC (for teach_phrase deduplication) */
    UPROPERTY(BlueprintReadWrite) TArray<FString> PhrasesTaught;
};

/**
 * Scavenger hunt category list for vocabulary rotation.
 */
static const TArray<FString> SCAVENGER_CATEGORIES = {
    TEXT("food"), TEXT("colors"), TEXT("animals"), TEXT("clothing"), TEXT("household"),
    TEXT("nature"), TEXT("body"), TEXT("professions"), TEXT("transportation"), TEXT("weather")
};

/**
 * Lightweight quest summary for the journal widget.
 */
USTRUCT(BlueprintType)
struct FQuestEntrySummary
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadWrite) FString QuestId;
    UPROPERTY(BlueprintReadWrite) FString Title;
    UPROPERTY(BlueprintReadWrite) FString Description;
    UPROPERTY(BlueprintReadWrite) FString QuestType;
    UPROPERTY(BlueprintReadWrite) FString Difficulty;
    UPROPERTY(BlueprintReadWrite) FString Status;
    UPROPERTY(BlueprintReadWrite) FString AssignedBy;
    UPROPERTY(BlueprintReadWrite) FString LocationName;
    UPROPERTY(BlueprintReadWrite) int32 TotalObjectives = 0;
    UPROPERTY(BlueprintReadWrite) int32 CompletedObjectives = 0;
    UPROPERTY(BlueprintReadWrite) TArray<FString> Tags;
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

    /** Track reputation gain for gain_reputation objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackReputationGain(const FString& FactionId, int32 Amount, const FString& QuestId = TEXT(""));

    /** Track a writing submission for write_response / describe_scene objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackWritingSubmission(const FString& Text, int32 WordCount, const FString& QuestId = TEXT(""));

    /** Track item delivery to an NPC for deliver_item objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackItemDelivery(const FString& NpcId, const TArray<FString>& PlayerItemNames, const FString& QuestId = TEXT(""));

    /** Track a gift given to an NPC for give_gift objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackGiftGiven(const FString& NpcId, const FString& ItemName, const FString& QuestId = TEXT(""));

    /** Track an enemy defeat for defeat_enemies objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackEnemyDefeated(const FString& EnemyType, const FString& QuestId = TEXT(""));

    /** Track escort NPC arrival for escort_npc objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackEscortArrival(const FString& NpcId, bool bReached, const FString& QuestId = TEXT(""));

    /** Track topic-based NPC conversation turns (directions, ordering, haggling, etc.). */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackNpcConversationTurn(const FString& NpcId, const FString& TopicTag = TEXT(""), const FString& QuestId = TEXT(""));

    /** Track NPC-initiated conversation acceptance for conversation_initiation objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackConversationInitiation(const FString& NpcId, bool bAccepted, const FString& QuestId = TEXT(""));

    /** Track teaching a vocabulary word to an NPC for teach_vocabulary objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackTeachWord(const FString& NpcId, const FString& Word, const FString& QuestId = TEXT(""));

    /** Track teaching a phrase to an NPC for teach_phrase objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackTeachPhrase(const FString& NpcId, const FString& Phrase, const FString& QuestId = TEXT(""));

    /** Track food ordering at a merchant for order_food objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackFoodOrdered(const FString& ItemName, const FString& MerchantId, const FString& BusinessType, const FString& QuestId = TEXT(""));

    /** Track price haggling in target language for haggle_price objectives. */
    UFUNCTION(BlueprintCallable, Category = "Quests")
    void TrackPriceHaggled(const FString& ItemName, const FString& MerchantId, const FString& TypedWord, const FString& QuestId = TEXT(""));

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

    /** Quest summaries for the journal widget. Populated during LoadFromIR. */
    UPROPERTY(BlueprintReadOnly, Category = "Quests")
    TArray<FQuestEntrySummary> QuestEntries;

private:
    TArray<FQuestObjective> Objectives;
    float GameTime = 0.f;

    /** Optional callback to test whether a world XZ point is inside a building footprint. */
    FPointInBuildingCheck PointInBuildingCheck;
};
