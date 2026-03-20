#include "QuestSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UQuestSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] QuestSystem initialized"));
}

void UQuestSystem::Deinitialize()
{
    Super::Deinitialize();
}

void UQuestSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* QuestsArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("quests"), QuestsArr))
        {
            QuestCount = QuestsArr->Num();
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d quests"), QuestCount);
        }
    }
}

bool UQuestSystem::AcceptQuest(const FString& QuestId)
{
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AcceptQuest: %s"), *QuestId);
    return true;
}

bool UQuestSystem::CompleteObjective(const FString& QuestId, const FString& ObjectiveId)
{
    for (auto& Obj : Objectives)
    {
        if (Obj.QuestId == QuestId && Obj.Id == ObjectiveId && !Obj.bCompleted)
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] CompleteObjective: %s / %s"), *QuestId, *ObjectiveId);
            return true;
        }
    }
    return false;
}

TArray<FString> UQuestSystem::CheckTimedObjectives()
{
    TArray<FString> Expired;

    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (Obj.TimeLimitSeconds <= 0.f || Obj.StartedAt < 0.f) continue;

        float Elapsed = GameTime - Obj.StartedAt;
        if (Elapsed > Obj.TimeLimitSeconds)
        {
            Obj.bCompleted = true;
            Expired.Add(FString::Printf(TEXT("Time expired: %s"), *Obj.Description));
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Timed objective expired: %s"), *Obj.Id);
        }
    }
    return Expired;
}

float UQuestSystem::GetObjectiveTimeRemaining(const FString& ObjectiveId) const
{
    for (const auto& Obj : Objectives)
    {
        if (Obj.Id == ObjectiveId && Obj.TimeLimitSeconds > 0.f && Obj.StartedAt >= 0.f)
        {
            float Elapsed = GameTime - Obj.StartedAt;
            return FMath::Max(0.f, Obj.TimeLimitSeconds - Elapsed);
        }
    }
    return -1.f;
}

FString UQuestSystem::RequestNavigationHint(const FString& QuestId)
{
    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("navigate_language") && Obj.Type != TEXT("follow_directions")) continue;

        Obj.HintsRequested++;
        Obj.bShowWaypoint = true;
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Navigation hint requested for %s (hint #%d)"), *Obj.Id, Obj.HintsRequested);
        return Obj.Description;
    }
    return FString();
}

void UQuestSystem::TrackVocabularyUsage(const FString& Word, const FString& QuestId)
{
    FString LowerWord = Word.ToLower();

    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("use_vocabulary") && Obj.Type != TEXT("collect_vocabulary")) continue;

        // If targetWords specified, only count matching words
        if (Obj.TargetWords.Num() > 0 && !Obj.TargetWords.Contains(LowerWord)) continue;

        // Don't double-count the same word
        if (Obj.WordsUsed.Contains(LowerWord)) continue;

        Obj.WordsUsed.Add(LowerWord);
        Obj.CurrentCount++;

        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 10))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Vocabulary objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackConversationTurn(const TArray<FString>& Keywords, const FString& QuestId)
{
    // Conversation-only objective types that progress on each conversation turn
    static const TSet<FString> ConversationOnlyTypes = {
        TEXT("complete_conversation"), TEXT("order_food"), TEXT("haggle_price"),
        TEXT("listen_and_repeat"), TEXT("ask_for_directions"), TEXT("describe_scene"),
        TEXT("write_response"), TEXT("build_friendship")
    };

    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (!ConversationOnlyTypes.Contains(Obj.Type)) continue;

        // Every conversation turn counts as progress
        Obj.CurrentCount++;

        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 5))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Conversation objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackPronunciationAttempt(bool bPassed, float Score, const FString& QuestId)
{
    if (!bPassed) return;

    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("pronunciation_check")) continue;

        Obj.CurrentCount++;

        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 3))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Pronunciation objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackWritingSubmission(const FString& Text, int32 WordCount, const FString& QuestId)
{
    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("write_response") && Obj.Type != TEXT("describe_scene")) continue;

        Obj.CurrentCount++;

        // Reject submissions below minimum word count
        if (Obj.MinWordCount > 0 && WordCount < Obj.MinWordCount) continue;

        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 1))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Writing objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackNpcConversationTurn(const FString& NpcId, const FString& TopicTag, const FString& QuestId)
{
    static const TMap<FString, TArray<FString>> TagToTypes = {
        { TEXT("directions"),    { TEXT("ask_for_directions") } },
        { TEXT("order"),         { TEXT("order_food") } },
        { TEXT("haggle"),        { TEXT("haggle_price") } },
        { TEXT("introduction"),  { TEXT("introduce_self") } },
        { TEXT("friendship"),    { TEXT("build_friendship") } },
    };

    TSet<FString> TargetTypes;
    if (!TopicTag.IsEmpty() && TagToTypes.Contains(TopicTag))
    {
        for (const auto& T : TagToTypes[TopicTag]) TargetTypes.Add(T);
    }
    else
    {
        TargetTypes = { TEXT("ask_for_directions"), TEXT("order_food"), TEXT("haggle_price"), TEXT("introduce_self"), TEXT("build_friendship") };
    }

    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (!TargetTypes.Contains(Obj.Type)) continue;
        if (!Obj.NpcId.IsEmpty() && Obj.NpcId != NpcId) continue;

        Obj.CurrentCount++;
        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 1))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] NPC conversation turn objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackConversationInitiation(const FString& NpcId, bool bAccepted, const FString& QuestId)
{
    if (!bAccepted) return;

    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("conversation_initiation")) continue;
        if (!Obj.NpcId.IsEmpty() && Obj.NpcId != NpcId) continue;

        Obj.CurrentCount++;
        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 1))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Conversation initiation objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackTeachWord(const FString& NpcId, const FString& Word, const FString& QuestId)
{
    FString LowerWord = Word.ToLower();
    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("teach_vocabulary")) continue;
        if (!Obj.NpcId.IsEmpty() && Obj.NpcId != NpcId) continue;

        if (Obj.WordsTaught.Contains(LowerWord)) continue;

        Obj.WordsTaught.Add(LowerWord);
        Obj.CurrentCount++;
        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 3))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Teach word objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::TrackTeachPhrase(const FString& NpcId, const FString& Phrase, const FString& QuestId)
{
    FString LowerPhrase = Phrase.ToLower();
    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("teach_phrase")) continue;
        if (!Obj.NpcId.IsEmpty() && Obj.NpcId != NpcId) continue;

        if (Obj.PhrasesTaught.Contains(LowerPhrase)) continue;

        Obj.PhrasesTaught.Add(LowerPhrase);
        Obj.CurrentCount++;
        if (Obj.CurrentCount >= (Obj.RequiredCount > 0 ? Obj.RequiredCount : 1))
        {
            Obj.bCompleted = true;
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Teach phrase objective completed: %s"), *Obj.Id);
        }
    }
}

void UQuestSystem::CheckDirectionProximity(const FVector& PlayerPos)
{
    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;

        if (Obj.Type == TEXT("follow_directions") || Obj.Type == TEXT("navigate_language"))
        {
            // Direction step proximity checking stub.
            // Game implementation should deserialize direction_steps/navigation_waypoints
            // from quest data and check player distance against each waypoint target.
        }
    }
}

FString UQuestSystem::GetNextScavengerCategory(int32 LastCategoryIndex)
{
    int32 Next = (LastCategoryIndex + 1) % SCAVENGER_CATEGORIES.Num();
    return SCAVENGER_CATEGORIES[Next];
}

void UQuestSystem::SetPointInBuildingCheck(const FPointInBuildingCheck& Check)
{
    PointInBuildingCheck = Check;
}

TArray<FVector> UQuestSystem::GenerateItemPositions(int32 Count) const
{
    TArray<FVector> Positions;
    const float Radius = 3000.f; // 30 m in UE units

    for (int32 i = 0; i < Count; i++)
    {
        float X = 0.f, Z = 0.f;
        for (int32 Attempt = 0; Attempt < 8; Attempt++)
        {
            float Angle = (PI * 2.f * i) / Count + FMath::FRandRange(0.f, 0.5f);
            float Dist = 1000.f + FMath::FRandRange(0.f, Radius);
            X = FMath::Cos(Angle) * Dist;
            Z = FMath::Sin(Angle) * Dist;
            if (!PointInBuildingCheck.IsBound() || !PointInBuildingCheck.Execute(X, Z))
            {
                break;
            }
        }
        Positions.Add(FVector(X, Z, 50.f)); // Slightly above ground
    }
    return Positions;
}

FVector UQuestSystem::GenerateLocationPosition() const
{
    for (int32 Attempt = 0; Attempt < 8; Attempt++)
    {
        float Angle = FMath::FRandRange(0.f, PI * 2.f);
        float Dist = 2000.f + FMath::FRandRange(0.f, 2000.f);
        float X = FMath::Cos(Angle) * Dist;
        float Z = FMath::Sin(Angle) * Dist;
        if (!PointInBuildingCheck.IsBound() || !PointInBuildingCheck.Execute(X, Z))
        {
            return FVector(X, Z, 0.f);
        }
    }
    // Fallback — push farther out
    float Angle = FMath::FRandRange(0.f, PI * 2.f);
    float Dist = 4000.f + FMath::FRandRange(0.f, 1000.f);
    return FVector(FMath::Cos(Angle) * Dist, FMath::Sin(Angle) * Dist, 0.f);
}

TArray<FVector> UQuestSystem::GetCollectibleItemPositions() const
{
    TArray<FVector> Positions;
    for (const auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (Obj.Type != TEXT("collect_item") && Obj.Type != TEXT("identify_object") && Obj.Type != TEXT("find_vocabulary_items")) continue;
        // Use generated positions for uncollected objectives
        TArray<FVector> ItemPositions = GenerateItemPositions(FMath::Max(1, Obj.RequiredCount - Obj.CurrentCount));
        Positions.Append(ItemPositions);
    }
    return Positions;
}

void UQuestSystem::SetMarkerDebugLabel(AActor* Marker, const FString& Label)
{
    if (!Marker) return;
    // Store debug label as an actor tag for hover tooltip / debug display.
    // Replaces floating 3D text labels with lightweight metadata.
    Marker->Tags.AddUnique(*FString::Printf(TEXT("DebugLabel:%s"), *Label));
}
