#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "EventBus.generated.h"

/**
 * Game event types matching GameEventBus.ts discriminated union.
 */
UENUM(BlueprintType)
enum class EInsimulEventType : uint8
{
    ItemCollected       UMETA(DisplayName = "Item Collected"),
    EnemyDefeated       UMETA(DisplayName = "Enemy Defeated"),
    LocationVisited     UMETA(DisplayName = "Location Visited"),
    NPCTalked           UMETA(DisplayName = "NPC Talked"),
    ItemDelivered       UMETA(DisplayName = "Item Delivered"),
    VocabularyUsed      UMETA(DisplayName = "Vocabulary Used"),
    ConversationTurn    UMETA(DisplayName = "Conversation Turn"),
    QuestAccepted       UMETA(DisplayName = "Quest Accepted"),
    QuestCompleted      UMETA(DisplayName = "Quest Completed"),
    CombatAction        UMETA(DisplayName = "Combat Action"),
    ReputationChanged   UMETA(DisplayName = "Reputation Changed"),
    ItemCrafted         UMETA(DisplayName = "Item Crafted"),
    LocationDiscovered  UMETA(DisplayName = "Location Discovered"),
    SettlementEntered   UMETA(DisplayName = "Settlement Entered"),
    PuzzleSolved        UMETA(DisplayName = "Puzzle Solved"),
    ItemRemoved         UMETA(DisplayName = "Item Removed"),
    ItemUsed            UMETA(DisplayName = "Item Used"),
    ItemDropped         UMETA(DisplayName = "Item Dropped"),
    ItemEquipped        UMETA(DisplayName = "Item Equipped"),
    ItemUnequipped          UMETA(DisplayName = "Item Unequipped"),
    UtteranceEvaluated      UMETA(DisplayName = "Utterance Evaluated"),
    UtteranceQuestProgress  UMETA(DisplayName = "Utterance Quest Progress"),
    UtteranceQuestCompleted UMETA(DisplayName = "Utterance Quest Completed"),
    AmbientConversationStarted UMETA(DisplayName = "Ambient Conversation Started"),
    AmbientConversationEnded   UMETA(DisplayName = "Ambient Conversation Ended"),
    VocabularyOverheard     UMETA(DisplayName = "Vocabulary Overheard"),
    StateCreatedTruth       UMETA(DisplayName = "State Created Truth"),
    StateExpiredTruth       UMETA(DisplayName = "State Expired Truth"),
    RomanceAction           UMETA(DisplayName = "Romance Action"),
    RomanceStageChanged     UMETA(DisplayName = "Romance Stage Changed"),
    NpcVolitionAction       UMETA(DisplayName = "NPC Volition Action"),
    PuzzleFailed            UMETA(DisplayName = "Puzzle Failed"),
    QuestFailed             UMETA(DisplayName = "Quest Failed"),
    QuestAbandoned          UMETA(DisplayName = "Quest Abandoned"),
    ConversationOverheard   UMETA(DisplayName = "Conversation Overheard"),
    CreateTruth             UMETA(DisplayName = "Create Truth"),
    // Assessment / onboarding events
    AssessmentStarted       UMETA(DisplayName = "Assessment Started"),
    AssessmentPhaseStarted  UMETA(DisplayName = "Assessment Phase Started"),
    AssessmentPhaseCompleted UMETA(DisplayName = "Assessment Phase Completed"),
    AssessmentTierChange    UMETA(DisplayName = "Assessment Tier Change"),
    AssessmentCompleted     UMETA(DisplayName = "Assessment Completed"),
    OnboardingStepStarted   UMETA(DisplayName = "Onboarding Step Started"),
    OnboardingStepCompleted UMETA(DisplayName = "Onboarding Step Completed"),
    OnboardingCompleted     UMETA(DisplayName = "Onboarding Completed"),
    PeriodicAssessmentTriggered UMETA(DisplayName = "Periodic Assessment Triggered"),
    AssessmentConversationQuestStart UMETA(DisplayName = "Assessment Conversation Quest Start"),
    AssessmentConversationCompleted UMETA(DisplayName = "Assessment Conversation Completed"),
    // Visual vocabulary quest events
    VisualVocabPrompted     UMETA(DisplayName = "Visual Vocab Prompted"),
    VisualVocabAnswered     UMETA(DisplayName = "Visual Vocab Answered"),
    // Follow directions quest events
    DirectionStepCompleted UMETA(DisplayName = "Direction Step Completed"),
    // Pronunciation quest events
    PronunciationAssessmentData UMETA(DisplayName = "Pronunciation Assessment Data"),
    // Point-and-name vocabulary events
    ObjectNamed UMETA(DisplayName = "Object Named"),
    // Object examination events
    ObjectExamined UMETA(DisplayName = "Object Examined"),
    // NPC exam events
    NpcExamStarted          UMETA(DisplayName = "NPC Exam Started"),
    NpcExamListeningReady   UMETA(DisplayName = "NPC Exam Listening Ready"),
    NpcExamQuestionAnswered UMETA(DisplayName = "NPC Exam Question Answered"),
    // Achievement events
    AchievementUnlocked UMETA(DisplayName = "Achievement Unlocked"),
    // Quest notification & reminder events
    QuestReminder       UMETA(DisplayName = "Quest Reminder"),
    QuestExpired        UMETA(DisplayName = "Quest Expired"),
    QuestMilestone      UMETA(DisplayName = "Quest Milestone"),
    DailyQuestsReset    UMETA(DisplayName = "Daily Quests Reset"),
    // NPC exam events
    NpcExamRequested    UMETA(DisplayName = "NPC Exam Requested"),
    NpcExamCompleted    UMETA(DisplayName = "NPC Exam Completed"),
    // NPC-initiated conversation events
    NpcInitiatedConversation UMETA(DisplayName = "NPC Initiated Conversation"),
    // Skill reward events
    SkillRewardsApplied UMETA(DisplayName = "Skill Rewards Applied")
};

// ── String ↔ Enum conversion ─────────────────────────────────────────────────
// Convert between snake_case event type strings (matching GameEventBus.ts) and
// the EInsimulEventType enum. Defined in EventBus.cpp.

/** Parse a snake_case event type string into the corresponding enum value.
 *  Returns ItemCollected and logs a warning for unknown strings. */
EInsimulEventType EventTypeFromString(const FString& TypeString);

/** Convert an enum value to its canonical snake_case string representation. */
FString EventTypeToString(EInsimulEventType EventType);

/**
 * Optional taxonomy fields carried on item events for Prolog assertion.
 * Mirrors ItemTaxonomy from GameEventBus.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulItemTaxonomy
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Material;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BaseType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Rarity;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemType;
};

/**
 * Unified game event payload.
 *
 * Since C++ cannot use TypeScript-style discriminated unions, this struct
 * carries all possible fields across every event type. Only fields relevant
 * to the given EventType are populated; the rest use defaults. This mirrors
 * the 37-variant GameEvent union in GameEventBus.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulGameEvent
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulEventType EventType = EInsimulEventType::ItemCollected;

    // ── Common fields ─────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FInsimulItemTaxonomy Taxonomy;

    // ── Entity / location fields ──────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString EntityId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString EnemyType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LocationId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LocationName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NPCId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NPCName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TurnCount = 0;

    // ── Dialogue / vocabulary ─────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Word;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bCorrect = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Keywords;

    // ── Quest fields ──────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestTitle;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AssignedByNpcId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AssignedByNpcName;

    // ── Combat fields ─────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetId;

    // ── Reputation fields ─────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FactionId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Delta = 0;

    // ── Settlement fields ─────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementName;

    // ── Puzzle fields ─────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PuzzleId;

    // ── Equipment fields ──────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Slot;

    // ── Utterance / language quest fields ────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectiveId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Input;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Score = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bPassed = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Feedback;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Current = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Required = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Percentage = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float FinalScore = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 XpAwarded = 0;

    // ── Ambient conversation fields ─────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ConversationId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Participants;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Topic;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 DurationMs = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 VocabularyCount = 0;

    // ── Vocabulary overheard fields ─────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Translation;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Language;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Context;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SpeakerNpcId;

    // ── State / truth fields ────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString StateType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Cause;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Title;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Content;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString EntryType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;

    // ── Romance fields ──────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bAccepted = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString StageChange;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FromStage;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ToStage;

    // ── Volition fields ─────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionId;

    // ── Puzzle / quest failure fields ───────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PuzzleType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Attempts = 0;

    // ── Conversation overheard fields ───────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NpcId1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NpcId2;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LanguageUsed;

    // ── Assessment / onboarding fields ───────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SessionId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString InstrumentId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Phase;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ParticipantId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float TotalScore = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float GainScore = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FromTier;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ToTier;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AssessmentType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PlayerId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PhaseId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 PhaseIndex = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MaxScore = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float TotalMaxScore = 0.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CefrLevel;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString StepId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 StepIndex = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TotalSteps = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TotalDurationMs = 0;

    // ── Assessment conversation quest fields ─────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Topics;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MinExchanges = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxExchanges = 0;

    // ── Follow directions fields ───────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectiveId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 StepsCompleted = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 StepsRequired = 0;

    // ── Periodic assessment fields ────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Level = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Tier;

    // ── Point-and-name / object examination fields ─────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetWord;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetLanguage;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Pronunciation;

    // ── NPC exam fields ──────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ExamId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BusinessType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AudioUrl;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Passage;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxReplays = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 QuestionCount = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestionId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxPoints = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float TotalMaxPoints = 0.0f;

    // ── Achievement fields ─────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AchievementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AchievementName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Icon;

    // ── Quest notification / reminder fields ─────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Message;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ReminderType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MilestoneType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Label;

    // ── NPC exam fields ──────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ExamType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BusinessContext;
};

// ── Delegates ────────────────────────────────────────────────────────────────

/** Delegate for type-specific event subscription. */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGameEvent, const FInsimulGameEvent&, Event);

/**
 * Centralized typed event system that bridges player actions to quest tracking
 * and Prolog fact assertion. All game actions (combat, items, dialogue, etc.)
 * emit events through this bus, which subscribers (PrologEngine, QuestSystem)
 * consume to update state.
 *
 * Ported from Insimul's Babylon.js GameEventBus to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UEventBus : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /**
     * Emit an event to all registered handlers.
     * Type-specific handlers and the global handler are both invoked.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    void Emit(const FInsimulGameEvent& Event);

    /**
     * Subscribe to a specific event type via delegate.
     * Returns an integer handle that can be passed to Unsubscribe().
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    int32 Subscribe(EInsimulEventType EventType, const FOnGameEvent& Handler);

    /**
     * Unsubscribe a previously registered handler by handle.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    void Unsubscribe(int32 Handle);

    /**
     * Global event delegate — fires for every event regardless of type.
     * Bind in Blueprint or C++ to receive all events.
     */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|EventBus")
    FOnGameEvent OnAnyEvent;

    /** Remove all handlers. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    void Dispose();

private:
    /** Per-type handler storage. */
    struct FTypedHandler
    {
        int32 Handle;
        EInsimulEventType EventType;
        FOnGameEvent Delegate;
    };

    TArray<FTypedHandler> TypedHandlers;
    int32 NextHandle = 1;
};
