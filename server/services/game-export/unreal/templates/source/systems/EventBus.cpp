#include "EventBus.h"

// ── String ↔ Enum Mappings ──────────────────────────────────────────────────
// These mirror the snake_case type strings from GameEventBus.ts so that events
// round-trip through IR JSON serialization.

static const TMap<FString, EInsimulEventType>& GetStringToEventTypeMap()
{
    static const TMap<FString, EInsimulEventType> Map = {
        { TEXT("item_collected"),                    EInsimulEventType::ItemCollected },
        { TEXT("enemy_defeated"),                    EInsimulEventType::EnemyDefeated },
        { TEXT("location_visited"),                  EInsimulEventType::LocationVisited },
        { TEXT("npc_talked"),                        EInsimulEventType::NPCTalked },
        { TEXT("item_delivered"),                    EInsimulEventType::ItemDelivered },
        { TEXT("vocabulary_used"),                   EInsimulEventType::VocabularyUsed },
        { TEXT("conversation_turn"),                 EInsimulEventType::ConversationTurn },
        { TEXT("quest_accepted"),                    EInsimulEventType::QuestAccepted },
        { TEXT("quest_completed"),                   EInsimulEventType::QuestCompleted },
        { TEXT("combat_action"),                     EInsimulEventType::CombatAction },
        { TEXT("reputation_changed"),                EInsimulEventType::ReputationChanged },
        { TEXT("item_crafted"),                      EInsimulEventType::ItemCrafted },
        { TEXT("location_discovered"),               EInsimulEventType::LocationDiscovered },
        { TEXT("settlement_entered"),                EInsimulEventType::SettlementEntered },
        { TEXT("puzzle_solved"),                     EInsimulEventType::PuzzleSolved },
        { TEXT("item_removed"),                      EInsimulEventType::ItemRemoved },
        { TEXT("item_used"),                         EInsimulEventType::ItemUsed },
        { TEXT("item_dropped"),                      EInsimulEventType::ItemDropped },
        { TEXT("item_equipped"),                     EInsimulEventType::ItemEquipped },
        { TEXT("item_unequipped"),                   EInsimulEventType::ItemUnequipped },
        { TEXT("utterance_evaluated"),               EInsimulEventType::UtteranceEvaluated },
        { TEXT("utterance_quest_progress"),          EInsimulEventType::UtteranceQuestProgress },
        { TEXT("utterance_quest_completed"),         EInsimulEventType::UtteranceQuestCompleted },
        { TEXT("ambient_conversation_started"),      EInsimulEventType::AmbientConversationStarted },
        { TEXT("ambient_conversation_ended"),        EInsimulEventType::AmbientConversationEnded },
        { TEXT("vocabulary_overheard"),              EInsimulEventType::VocabularyOverheard },
        { TEXT("state_created_truth"),               EInsimulEventType::StateCreatedTruth },
        { TEXT("state_expired_truth"),               EInsimulEventType::StateExpiredTruth },
        { TEXT("romance_action"),                    EInsimulEventType::RomanceAction },
        { TEXT("romance_stage_changed"),             EInsimulEventType::RomanceStageChanged },
        { TEXT("npc_volition_action"),               EInsimulEventType::NpcVolitionAction },
        { TEXT("puzzle_failed"),                     EInsimulEventType::PuzzleFailed },
        { TEXT("quest_failed"),                      EInsimulEventType::QuestFailed },
        { TEXT("quest_abandoned"),                   EInsimulEventType::QuestAbandoned },
        { TEXT("conversation_overheard"),            EInsimulEventType::ConversationOverheard },
        { TEXT("create_truth"),                      EInsimulEventType::CreateTruth },
        { TEXT("assessment_started"),                EInsimulEventType::AssessmentStarted },
        { TEXT("assessment_phase_started"),          EInsimulEventType::AssessmentPhaseStarted },
        { TEXT("assessment_phase_completed"),        EInsimulEventType::AssessmentPhaseCompleted },
        { TEXT("assessment_tier_change"),            EInsimulEventType::AssessmentTierChange },
        { TEXT("assessment_completed"),              EInsimulEventType::AssessmentCompleted },
        { TEXT("onboarding_step_started"),           EInsimulEventType::OnboardingStepStarted },
        { TEXT("onboarding_step_completed"),         EInsimulEventType::OnboardingStepCompleted },
        { TEXT("onboarding_completed"),              EInsimulEventType::OnboardingCompleted },
        { TEXT("periodic_assessment_triggered"),     EInsimulEventType::PeriodicAssessmentTriggered },
        { TEXT("assessment_conversation_quest_start"), EInsimulEventType::AssessmentConversationQuestStart },
        { TEXT("assessment_conversation_completed"), EInsimulEventType::AssessmentConversationCompleted },
        { TEXT("visual_vocab_prompted"),             EInsimulEventType::VisualVocabPrompted },
        { TEXT("visual_vocab_answered"),             EInsimulEventType::VisualVocabAnswered },
        { TEXT("direction_step_completed"),          EInsimulEventType::DirectionStepCompleted },
        { TEXT("pronunciation_assessment_data"),     EInsimulEventType::PronunciationAssessmentData },
        { TEXT("object_named"),                       EInsimulEventType::ObjectNamed },
        { TEXT("achievement_unlocked"),              EInsimulEventType::AchievementUnlocked },
        { TEXT("quest_reminder"),                    EInsimulEventType::QuestReminder },
        { TEXT("quest_expired"),                     EInsimulEventType::QuestExpired },
        { TEXT("quest_milestone"),                   EInsimulEventType::QuestMilestone },
        { TEXT("daily_quests_reset"),                EInsimulEventType::DailyQuestsReset },
        { TEXT("npc_exam_requested"),                EInsimulEventType::NpcExamRequested },
        { TEXT("npc_exam_completed"),                EInsimulEventType::NpcExamCompleted },
    };
    return Map;
}

static const TMap<EInsimulEventType, FString>& GetEventTypeToStringMap()
{
    static TMap<EInsimulEventType, FString> Map;
    if (Map.Num() == 0)
    {
        // Build reverse map from the canonical string→enum map.
        for (const auto& Pair : GetStringToEventTypeMap())
        {
            Map.Add(Pair.Value, Pair.Key);
        }
    }
    return Map;
}

EInsimulEventType EventTypeFromString(const FString& TypeString)
{
    const auto* Found = GetStringToEventTypeMap().Find(TypeString);
    if (Found)
    {
        return *Found;
    }
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] EventTypeFromString: unknown event type '%s', defaulting to ItemCollected"), *TypeString);
    return EInsimulEventType::ItemCollected;
}

FString EventTypeToString(EInsimulEventType EventType)
{
    const auto* Found = GetEventTypeToStringMap().Find(EventType);
    if (Found)
    {
        return *Found;
    }
    return TEXT("unknown");
}

// ── UEventBus Implementation ────────────────────────────────────────────────

void UEventBus::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    NextHandle = 1;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EventBus initialized"));
}

void UEventBus::Deinitialize()
{
    Dispose();
    Super::Deinitialize();
}

void UEventBus::Emit(const FInsimulGameEvent& Event)
{
    // Fire type-specific handlers
    for (const FTypedHandler& Handler : TypedHandlers)
    {
        if (Handler.EventType == Event.EventType)
        {
            // Wrap in try-equivalent: Unreal delegates don't throw, but
            // we guard against removed/invalid delegates gracefully.
            if (Handler.Delegate.IsBound())
            {
                Handler.Delegate.Broadcast(Event);
            }
        }
    }

    // Fire global handlers
    if (OnAnyEvent.IsBound())
    {
        OnAnyEvent.Broadcast(Event);
    }

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] EventBus::Emit type=%d"), (int32)Event.EventType);
}

int32 UEventBus::Subscribe(EInsimulEventType EventType, const FOnGameEvent& Handler)
{
    FTypedHandler Entry;
    Entry.Handle = NextHandle++;
    Entry.EventType = EventType;
    Entry.Delegate = Handler;
    TypedHandlers.Add(Entry);

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] EventBus::Subscribe type=%d handle=%d"), (int32)EventType, Entry.Handle);
    return Entry.Handle;
}

void UEventBus::Unsubscribe(int32 Handle)
{
    TypedHandlers.RemoveAll([Handle](const FTypedHandler& H) {
        return H.Handle == Handle;
    });

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] EventBus::Unsubscribe handle=%d"), Handle);
}

void UEventBus::Dispose()
{
    TypedHandlers.Empty();
    OnAnyEvent.Clear();
    NextHandle = 1;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EventBus disposed"));
}
