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
    for (auto& Obj : Objectives)
    {
        if (Obj.bCompleted) continue;
        if (!QuestId.IsEmpty() && Obj.QuestId != QuestId) continue;
        if (Obj.Type != TEXT("complete_conversation")) continue;

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
