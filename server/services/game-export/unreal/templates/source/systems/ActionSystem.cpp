#include "ActionSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UActionSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ActionSystem initialized"));
}

void UActionSystem::Deinitialize()
{
    Super::Deinitialize();
}

void UActionSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    const TArray<TSharedPtr<FJsonValue>>* ActionsArr;
    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj) &&
        (*SystemsObj)->TryGetArrayField(TEXT("actions"), ActionsArr))
    {
        ActionCount = ActionsArr->Num();
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d actions"), ActionCount);
    }
}

bool UActionSystem::ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target)
{
    // TODO: Look up action by ID, validate preconditions, apply effects
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ExecuteAction: %s"), *ActionId);
    return true;
}
