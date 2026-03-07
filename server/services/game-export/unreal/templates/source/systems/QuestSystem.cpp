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
    // TODO: Mark quest as active, notify UI
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AcceptQuest: %s"), *QuestId);
    return true;
}

bool UQuestSystem::CompleteObjective(const FString& QuestId, const FString& ObjectiveId)
{
    // TODO: Increment objective progress, check quest completion
    UE_LOG(LogTemp, Log, TEXT("[Insimul] CompleteObjective: %s / %s"), *QuestId, *ObjectiveId);
    return true;
}
