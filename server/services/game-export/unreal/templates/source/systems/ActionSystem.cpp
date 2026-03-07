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

FInsimulActionResult UActionSystem::ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target)
{
    FInsimulActionResult Result;
    // TODO: Look up action by ID and validate preconditions

    UE_LOG(LogTemp, Log, TEXT("[Insimul] ExecuteAction: %s"), *ActionId);

    // Process effects from action definition
    // Effects with category 'item' produce item grants/removals
    // Effects with category 'gold' produce gold changes
    // The game should listen to OnGoldEffect / OnItemEffect delegates
    // to apply changes to the InventorySystem.

    // Example: iterate parsed effects and broadcast
    for (const FInsimulActionEffect& Effect : Result.Effects)
    {
        if (Effect.Type == TEXT("gold"))
        {
            OnGoldEffect.Broadcast(static_cast<int32>(Effect.Value));
        }
        else if (Effect.Type == TEXT("item"))
        {
            OnItemEffect.Broadcast(Effect.ItemId, Effect.Quantity);
        }
    }

    Result.bSuccess = true;
    return Result;
}
